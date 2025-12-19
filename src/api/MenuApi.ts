// // src/api/MenuApi.ts
// import { apiClient } from '../Lib/ApiClient';
// import type { CategoryResponse, MenuItem, MenuOptionGroup } from '../types/OrderTypes';

// // 1. 전체 메뉴 조회 (API 사용 - 백엔드 준비 시 활성화)
// export const fetchMenus = async (): Promise<CategoryResponse[]> => {
//   const res = await apiClient.get<CategoryResponse[]>('/categories-with-menus');
//   return res.data;
// };

// // 2. 추천 메뉴 조회 (API 사용 - 백엔드 준비 시 활성화)
// export const fetchRecommendMenus = async (params: {
//   timeSlot: string;     // 'MORNING', 'AFTERNOON', 'EVENING'
//   gender?: string;      // 'MALE', 'FEMALE' (선택)
//   ageGroup?: string;    // '20대', '30대' ... (선택)
//   limit?: number;       // 기본값 10
// }): Promise<MenuItem[]> => {
//   const res = await apiClient.get<MenuItem[]>('/menus/recommend', {
//     params: {
//       ...params,
//       limit: params.limit || 10, // 기본 10개
//     },
//   });
//   return res.data;
// };

// // 3. 메뉴 상세 옵션 조회 (API 사용 - 백엔드 준비 시 활성화)
// export const fetchMenuOptions = async (menuId: number): Promise<MenuOptionGroup[]> => {
//   const res = await apiClient.get<MenuOptionGroup[]>(`/menus/${menuId}/options`);
//   return res.data;
// };
