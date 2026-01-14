// src/api/MenuApi.ts
import { apiClient } from './ApiClient.ts';
import type {
  MenuApiResponse,
  BackendCategory,
  BackendMenu,
  RecommendResponse, // [추가] 위에서 만든 타입
} from '../types/OrderTypes';

import type { MenuOptionsResponse, BackendOptionGroup } from '../types/OptionTypes';

// 1. 전체 메뉴 조회
export const fetchMenus = async (): Promise<BackendCategory[]> => {
  const res = await apiClient.get<MenuApiResponse>('/categories-with-menus');
  return res.data?.categories || [];
};

// 2. 추천 메뉴 조회 (수정 완료)
export const fetchRecommendMenus = async (params: {
  timeSlot: string;
  gender?: string;
  ageGroup?: string;
  limit?: number;
}): Promise<BackendMenu[]> => {
  // RecommendResponse 타입으로 응답을 받습니다.
  try {
    const res = await apiClient.get<RecommendResponse>('/menus/recommend', {
      params: {
        timeSlot: params.timeSlot,
        gender: params.gender || undefined, // null 대신 undefined (쿼리스트링에서 제외됨)
        ageGroup: params.ageGroup || undefined,
        limit: params.limit || 10,
      },
    });

  // [핵심] 껍데기 안의 'recommendedMenus' 배열을 꺼내서 반환합니다.
  return res.data?.recommendedMenus || [];
  } catch (error) {
    console.error('[추천 메뉴 조회 실패]', error);
    return [];
  }
};

// 3. 메뉴 상세 옵션 조회
export const fetchMenuOptions = async (menuId: number): Promise<BackendOptionGroup[]> => {
  const res = await apiClient.get<MenuOptionsResponse>(`/menus/${menuId}/options`);
  // 변환 없이 백엔드 그룹 배열을 바로 리턴
  return res.data?.optionGroups || [];
};
