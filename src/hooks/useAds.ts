import { useEffect, useMemo, useState } from 'react';
import { api, joinUrl, resolveMediaUrl } from '../Lib/api';
import { ADS } from '../config/ads';
import type { Ad, GetAdsResponse } from '../types/ad';

type UseAdsResult = {
  ads: Ad[];
  isLoading: boolean;
  error: unknown;
};

const TTL_MS = 60_000;

let cache: { at: number; ads: Ad[]; key: string } | null = null;
let inflight: { key: string; promise: Promise<Ad[]> } | null = null;

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

function normalizeBackendMediaUrl(mediaUrl: string): string {
  const url = (mediaUrl ?? '').trim();
  if (!url) return url;

  const baseUrl = (api.defaults.baseURL ?? '').toString();

  // 백엔드가 정적 리소스를 /ads, /raw 같은 경로로 서빙하는 경우
  if (baseUrl && (url.startsWith('/ads/') || url.startsWith('/raw/'))) {
    return joinUrl(baseUrl, url);
  }

  return resolveMediaUrl(url);
}

function getLocalAds(): Ad[] {
  return ADS.map((a) => ({
    adId: a.id,
    title: `ad-${a.id}`,
    mediaType: 'IMAGE',
    mediaUrl: resolveMediaUrl(a.image),
    startDate: '1970-01-01',
    endDate: '2999-12-31',
    isActive: true,
  }));
}

async function fetchAds(): Promise<Ad[]> {
  try {
    // Advertisement 페이지에서는 타겟룰 필터가 필요 없으므로, 전체 광고 목록을 가져옵니다.
    const res = await api.get<GetAdsResponse | Ad[]>('/api/ads');

    const allActive = asArrayAds(res.data)
      .filter((ad) => ad && ad.isActive !== false)
      .map((ad) => ({
        ...ad,
        mediaUrl: normalizeBackendMediaUrl(ad.mediaUrl),
      }));

    return allActive.length > 0 ? allActive : getLocalAds();
  } catch {
    return getLocalAds();
  }
}

/**
 * 백엔드에서 광고를 가져오되, 간단한 메모리 캐시(60s TTL)를 사용합니다.
 * - 응답에서 `res.data.ads`만 사용합니다.
 */
export function useAds(): UseAdsResult {
  // Advertisement 페이지에서도 사용되므로 demographics에 의존하지 않는 key를 씁니다.
  // (결제 완료 팝업에서만 타겟룰을 적용)
  const cacheKey = 'ads:all';

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
        : (inflight = { key: cacheKey, promise: fetchAds() }).promise;

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
  }, [cacheKey, shouldUseCache]);

  return { ads, isLoading, error };
}
