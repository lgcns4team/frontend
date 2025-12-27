import { useEffect, useMemo, useState } from 'react';
import { resolveMediaUrl } from '../Lib/api';
import { ADS } from '../config/ads';
import type { Ad } from '../types/ad';
import { useAnalysisStore } from '../store/analysisStore';

type UseAdsResult = {
  ads: Ad[];
  isLoading: boolean;
  error: unknown;
};

const TTL_MS = 60_000;

let cache: { at: number; ads: Ad[]; key: string } | null = null;
let inflight: { key: string; promise: Promise<Ad[]> } | null = null;

function hasAgeConstraint(a: { ageMin?: number; ageMax?: number }) {
  return a.ageMin != null || a.ageMax != null;
}

function matchesAge(a: { ageMin?: number; ageMax?: number }, age: number): boolean {
  if (a.ageMin != null && age < a.ageMin) return false;
  if (a.ageMax != null && age > a.ageMax) return false;
  return true;
}

function getLocalAds(age: number | null): Ad[] {
  const generic = ADS.filter((a) => !hasAgeConstraint(a));

  if (age == null) {
    const base = generic.length > 0 ? generic : ADS;
    return base.map((a) => ({
      adId: a.id,
      title: `ad-${a.id}`,
      mediaType: 'IMAGE',
      mediaUrl: resolveMediaUrl(a.image),
      startDate: '1970-01-01',
      endDate: '2999-12-31',
      isActive: true,
    }));
  }

  const targetedMatches = ADS.filter((a) => hasAgeConstraint(a) && matchesAge(a, age));
  const base = targetedMatches.length > 0 ? targetedMatches : generic.length > 0 ? generic : ADS;

  return base.map((a) => ({
    adId: a.id,
    title: `ad-${a.id}`,
    mediaType: 'IMAGE',
    mediaUrl: resolveMediaUrl(a.image),
    startDate: '1970-01-01',
    endDate: '2999-12-31',
    isActive: true,
  }));
}

async function fetchAds(age: number | null): Promise<Ad[]> {
  // NOTE: 백엔드에서 광고 데이터가 준비되면 아래 코드를 복구해서 사용하세요.
  // (현재는 프론트 `public/ads`의 로컬 이미지(1~3번)를 광고로 사용)
  //
  // const res = await api.get<GetAdsResponse>('/api/ads');
  // const ads = res.data.ads ?? [];
  //
  // // VITE_API_BASE_URL 규칙에 맞게 mediaUrl을 정규화합니다.
  // return ads.map((ad) => ({
  //   ...ad,
  //   mediaUrl: resolveMediaUrl(ad.mediaUrl),
  // }));

  return getLocalAds(age);
}

/**
 * 백엔드에서 광고를 가져오되, 간단한 메모리 캐시(60s TTL)를 사용합니다.
 * - 응답에서 `res.data.ads`만 사용합니다.
 */
export function useAds(): UseAdsResult {
  const age = useAnalysisStore((s) => s.age);
  const cacheKey = `age:${age ?? 'unknown'}`;

  const [ads, setAds] = useState<Ad[]>(() => (cache?.key === cacheKey ? cache.ads : []));
  const [isLoading, setIsLoading] = useState<boolean>(() => !(cache?.key === cacheKey));
  const [error, setError] = useState<unknown>(null);

  const shouldUseCache = useMemo(() => {
    if (!cache) return false;
    if (cache.key !== cacheKey) return false;
    return Date.now() - cache.at < TTL_MS;
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;

    if (shouldUseCache && cache) {
      setAds(cache.ads);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const p =
      inflight?.key === cacheKey
        ? inflight.promise
        : (inflight = { key: cacheKey, promise: fetchAds(age) }).promise;

    p.then((fresh) => {
      cache = { at: Date.now(), ads: fresh, key: cacheKey };
      if (!cancelled) {
        setAds(fresh);
        setIsLoading(false);
      }
    })
      .catch((e) => {
        if (!cancelled) {
          setError(e);
          setIsLoading(false);
        }
      })
      .finally(() => {
        // inflight는 (우리 요청이라고 가정 가능한 경우에만) 해제합니다.
        if (inflight?.key === cacheKey) {
          inflight = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [age, cacheKey, shouldUseCache]);

  return { ads, isLoading, error };
}
