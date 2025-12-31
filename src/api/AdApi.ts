// src/api/AdApi.ts
import { apiClient } from './ApiClient';
import type { Ad, GetAdsResponse } from '../types/AdTypes';

/**
 * 결제 후 맞춤형 광고 조회
 * @param ageGroup 예: '20대', '30대'
 * @param gender 'M' | 'F'
 */
export const fetchPaymentAds = async (
  ageGroup: string,
  gender: string
): Promise<Ad[]> => {
  const response = await apiClient.get<GetAdsResponse>('/ads/payment', {
    params: { ageGroup, gender },
  });
  return response.data.ads || [];
};
