import { useEffect, useMemo, useState } from 'react';
import { api, joinUrl, resolveMediaUrl } from '../Lib/api';
import { ADS } from '../config/ads';
import type { Ad, GetAdsResponse } from '../types/ad';
import { useAnalysisStore } from '../store/analysisStore';

type UseAdsResult = {
  ads: Ad[];
  isLoading: boolean;
  error: unknown;
};

const TTL_MS = 60_000;

type CacheSource = 'backend' | 'local';

type AdsFetchResult = {
  ads: Ad[];
  source: CacheSource;
};

let cache: { at: number; ads: Ad[]; key: string; source: CacheSource } | null = null;
let inflight: { key: string; promise: Promise<AdsFetchResult> } | null = null;

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

function normalizeBackendMediaUrl(mediaUrl: string): string {
  const url = (mediaUrl ?? '').trim();
  if (!url) return url;

  const baseUrl = (api.defaults.baseURL ?? '').toString();

  // 백엔드가 정적 리소스를 /ads, /raw 같은 경로로 서빙하는 경우를 지원합니다.
  // (resolveMediaUrl은 프론트 public 자산을 보호하려고 /ads, /raw를 same-origin으로 유지합니다.)
  if (baseUrl && (url.startsWith('/ads/') || url.startsWith('/raw/'))) {
    return joinUrl(baseUrl, url);
  }

  return resolveMediaUrl(url);
}

function asArrayAds(data: unknown): Ad[] {
  if (!data) return [];

  // 케이스 1) { ads: [...] }
  if (typeof data === 'object' && data !== null && 'ads' in data) {
    const ads = (data as GetAdsResponse).ads;
    return Array.isArray(ads) ? ads : [];
  }

  // 케이스 2) [...]
  return Array.isArray(data) ? (data as Ad[]) : [];
}

async function fetchAds(age: number | null): Promise<AdsFetchResult> {
  try {
    // 백엔드에서 광고를 가져옵니다.
    // - 응답 스키마는 GetAdsResponse({ ads, totalCount })를 기대하지만,
    //   백엔드 더미/개발 편의를 위해 배열([Ad])도 허용합니다.
    const res = await api.get<GetAdsResponse | Ad[]>('/api/ads', {
      // 백엔드가 age 기반 필터를 지원하면 활용할 수 있습니다(미지원이면 무시될 수 있음).
      params: age != null ? { age } : undefined,
    });

    const ads = asArrayAds(res.data)
      .filter((ad) => ad && ad.isActive !== false)
      .map((ad) => ({
        ...ad,
        mediaUrl: normalizeBackendMediaUrl(ad.mediaUrl),
      }));

    // 백엔드가 비어있으면 로컬 광고로 폴백하여 광고 화면이 비지 않게 합니다.
    return ads.length > 0 ? { ads, source: 'backend' } : { ads: getLocalAds(age), source: 'local' };
  } catch {
    // 네트워크/서버 문제가 있어도 앱이 비지 않도록 로컬 광고로 폴백합니다.
    return { ads: getLocalAds(age), source: 'local' };
  }
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
    // 로컬 폴백 캐시는 "예전 광고"를 가릴 수 있으므로, 백엔드 캐시만 TTL로 재사용합니다.
    if (cache.source !== 'backend') return false;
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
      cache = { at: Date.now(), ads: fresh.ads, key: cacheKey, source: fresh.source };
      if (!cancelled) {
        setAds(fresh.ads);
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
