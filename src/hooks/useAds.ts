import { useEffect, useMemo, useState } from 'react';
import { api, resolveMediaUrl } from '../Lib/api';
import type { Ad, GetAdsResponse } from '../types/ad';

type UseAdsResult = {
  ads: Ad[];
  isLoading: boolean;
  error: unknown;
};

const TTL_MS = 60_000;

let cache: { at: number; ads: Ad[] } | null = null;
let inflight: Promise<Ad[]> | null = null;

async function fetchAds(): Promise<Ad[]> {
  const res = await api.get<GetAdsResponse>('/api/ads');
  const ads = res.data.ads ?? [];

  // Normalize mediaUrl based on VITE_API_BASE_URL rules.
  return ads.map((ad) => ({
    ...ad,
    mediaUrl: resolveMediaUrl(ad.mediaUrl),
  }));
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
