// src/api/MenuApi.ts
import { apiClient } from './ApiClient';
import type { 
  MenuApiResponse, 
  BackendCategory, 
  BackendMenu, 
  RecommendResponse, // [추가] 위에서 만든 타입
  MenuOptionGroup,
  MenuOptionsResponse // [추가] 위에서 만든 타입
} from '../types/OrderTypes';

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
  const res = await apiClient.get<RecommendResponse>('/menus/recommend', {
    params: {
      ...params,
      limit: params.limit || 10,
    },
  });
  
  // [핵심] 껍데기 안의 'recommendedMenus' 배열을 꺼내서 반환합니다.
  return res.data?.recommendedMenus || [];
};

// 3. 메뉴 상세 옵션 조회
export const fetchMenuOptions = async (menuId: number): Promise<MenuOptionGroup[]> => {
  // 백엔드에서 날것의 데이터를 받아옵니다.
  const res = await apiClient.get<MenuOptionsResponse>(`/menus/${menuId}/options`);
  
  // 백엔드 데이터(res.data.optionGroups)를 프론트엔드 모양(MenuOptionGroup[])으로 변환합니다.
  const backendGroups = res.data?.optionGroups || [];

  return backendGroups.map((group) => ({
    // 1. ID 매핑
    id: group.optionGroupId,
    name: group.name,
    
    // 2. 필수 여부(boolean) -> 최소 선택 개수(number) 변환
    // true면 무조건 1개 선택, false면 0개(선택 안 해도 됨)
    minSelect: group.isRequired ? 1 : 0,

    // 3. 선택 타입(string) -> 최대 선택 개수(number) 변환
    // "SINGLE"이라고 오면 1개만, 그 외에는 10개(여러 개) 선택 가능
    maxSelect: group.selectionType === 'SINGLE' ? 1 : 10,

    // 4. 내부 옵션 아이템들도 매핑
    options: group.options.map((opt) => ({
      id: opt.optionItemId,       // optionItemId -> id
      name: opt.name,
      price: opt.optionPrice,     // optionPrice -> price
    })),
  }));
};