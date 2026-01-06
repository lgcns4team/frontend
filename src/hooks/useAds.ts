import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/ApiClient';
import { ADS } from '../config/ads';
import type { Ad, GetAdsResponse } from '../types/ad';

type UseAdsResult = {
  ads: Ad[];
  isLoading: boolean;
  error: unknown;
};

// 광고 캐시 유효 시간 (60초)
const TTL_MS = 60_000;

// 전역 메모리 캐시 (여러 요청의 중복 전송 방지)
let cache: { at: number; ads: Ad[]; key: string } | null = null;
let inflight: { key: string; promise: Promise<Ad[]> } | null = null;

/**
 * 백엔드 응답을 배열로 정규화합니다.
 * - { ads: [...] } 형식과 [...] 형식 모두 지원
 */
function asArrayAds(data: unknown): Ad[] {
  if (!data) return [];

  // 케이스 1) { ads: [...] } 형식
  if (typeof data === 'object' && data !== null && 'ads' in data) {
    const ads = (data as GetAdsResponse).ads;
    return Array.isArray(ads) ? ads : [];
  }

  // 케이스 2) [...] 직접 배열 형식
  return Array.isArray(data) ? (data as Ad[]) : [];
}

/**
 * 백엔드 응답 검증 및 정규화
 *
 * 백엔드에서 온 광고 객체를 표준 형식으로 변환합니다.
 * - targetRules 배열이 있으면 그대로 사용
 * - 없으면 ageGroup/gender 필드로부터 targetRules 생성 (레거시 지원)
 * - 타겟 정보가 완전히 없으면 undefined (모든 사용자 대상)
 *
 * @param ad - 백엔드에서 받은 광고 객체
 * @returns 정규화된 광고 객체
 */

function normalizeAd(ad: any): Ad {
  const normalized: Ad = {
    adId: ad.adId ?? ad.id ?? 0,
    title: ad.title ?? '',
    mediaType: (ad.mediaType ?? 'IMAGE') as 'IMAGE' | 'VIDEO',
    mediaUrl: ad.mediaUrl ?? '',
    startDate: ad.startDate ?? '1970-01-01',
    endDate: ad.endDate ?? '2999-12-31',
    isActive: ad.isActive !== false,
  };

  // targetRules 정규화
  if (Array.isArray(ad.targetRules) && ad.targetRules.length > 0) {
    normalized.targetRules = ad.targetRules.map((rule: any) => ({
      ageGroup: rule.ageGroup ?? null,
      gender: rule.gender ?? null,
    }));
  } else if (ad.ageGroup != null || ad.gender != null) {
    // 레거시 형식: 광고 자체에 ageGroup/gender가 있으면 targetRules로 변환
    normalized.targetRules = [
      {
        ageGroup: ad.ageGroup ?? null,
        gender: ad.gender ?? null,
      },
    ];
  }

  return normalized;
}

/**
 * 로컬 폴백 광고 목록 반환
 * 백엔드 연결 실패 시 사용합니다.
 * @returns 타겟팅 정보 없는 기본 광고 목록
 */
function getLocalAds(): Ad[] {
  return ADS.map((a) => ({
    adId: a.id,
    title: `ad-${a.id}`,
    mediaType: 'IMAGE' as const,
    mediaUrl: a.image,
    startDate: '1970-01-01',
    endDate: '2999-12-31',
    isActive: true,
  }));
}

/**
 * 백엔드에서 광고 목록을 페칭합니다.
 * - GET /api/ads 에서 targetRules 정보까지 받습니다.
 * - 정규화하여 표준 형식으로 변환합니다.
 *
 * @returns 활성화된 광고 배열 (백엔드 실패 시 로컬 광고)
 */
async function fetchAds(): Promise<Ad[]> {
  try {
    const res = await apiClient.get<GetAdsResponse | Ad[]>('/ads');

    // 응답 정규화 및 검증
    const allAds = asArrayAds(res.data).map(normalizeAd);
    // 활성 광고만 필터링
    const allActive = allAds.filter((ad) => ad.isActive);

    if (allActive.length === 0) {
      return getLocalAds();
    }

    return allActive;
  } catch (e) {
    // 네트워크 에러나 서버 에러 발생 시 로컬 광고로 폴백
    return getLocalAds();
  }
}

/**
 * 백엔드에서 광고 목록을 가져오는 커스텀 훅
 *
 * 특징:
 * - 60초 TTL 메모리 캐시 (같은 광고 목록을 반복 요청하지 않음)
 * - 중복 요청 방지 (inflight 체크)
 * - 취소 가능한 요청 (컴포넌트 언마운트 시)
 * - 광고와 나이/성별 타겟팅 정보를 모두 포함
 *
 * @returns { ads, isLoading, error }
 * - ads: 광고 배열
 * - isLoading: 로딩 중 여부
 * - error: 에러 정보 (실패 시에도 로컬 광고 반환됨)
 */
export function useAds(): UseAdsResult {
  // Advertisement 페이지와 결제 완료 팝업 모두에서 사용하므로
  // 나이/성별에 상관없이 전체 광고 목록을 캐시합니다.
  // (타겟팅은 PaymentProgressModal에서 수행)
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
