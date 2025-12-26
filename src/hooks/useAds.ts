import { useEffect, useMemo, useState } from 'react';
import { resolveMediaUrl } from '../Lib/api';
import { ADS } from '../config/ads';
import type { Ad } from '../types/ad';

type UseAdsResult = {
  ads: Ad[];
  isLoading: boolean;
  error: unknown;
};

const TTL_MS = 60_000;

let cache: { at: number; ads: Ad[] } | null = null;
let inflight: Promise<Ad[]> | null = null;

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
  // NOTE: 백엔드에서 광고 데이터가 준비되면 아래 코드를 복구해서 사용하세요.
  // (현재는 프론트 `public/ads`의 로컬 이미지(1~3번)를 광고로 사용)
  //
  // const res = await api.get<GetAdsResponse>('/api/ads');
  // const ads = res.data.ads ?? [];
  //
  // // Normalize mediaUrl based on VITE_API_BASE_URL rules.
  // return ads.map((ad) => ({
  //   ...ad,
  //   mediaUrl: resolveMediaUrl(ad.mediaUrl),
  // }));

  return getLocalAds();
}

/**
 * Fetch ads from backend with a simple in-memory cache (60s TTL).
 * - Uses only `res.data.ads` from the response.
 */
export function useAds(): UseAdsResult {
  const [ads, setAds] = useState<Ad[]>(() => cache?.ads ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cache);
  const [error, setError] = useState<unknown>(null);

  const shouldUseCache = useMemo(() => {
    if (!cache) return false;
    return Date.now() - cache.at < TTL_MS;
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (shouldUseCache && cache) {
      setAds(cache.ads);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const p = inflight ?? (inflight = fetchAds());

    p.then((fresh) => {
      cache = { at: Date.now(), ads: fresh };
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
        // release inflight only if it was ours (safe enough)
        inflight = null;
      });

    return () => {
      cancelled = true;
    };
  }, [shouldUseCache]);

  return { ads, isLoading, error };
}
