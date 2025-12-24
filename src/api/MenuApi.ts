// src/api/MenuApi.ts
import { apiClient } from '../Lib/ApiClient';
import type { CategoryResponse, MenuItem, MenuOptionGroup } from '../types/OrderTypes';
import { tempMockCategories, tempMockRecommendMenus, tempMockOptions } from './tempmock';
// import { mpMock';

// 전체 메뉴
export const fetchMenus = async (): Promise<CategoryResponse[]> => {
  try {
    const res = await apiClient.get<CategoryResponse[]>('/categories-with-menus');
    return res.data;
  } catch {
    return tempMockCategories;
  }
};

// 추천 메뉴
export const fetchRecommendMenus = async (): Promise<MenuItem[]> => {
  try {
    const res = await apiClient.get<MenuItem[]>('/menus/recommend');
    return res.data;
  } catch {
    return tempMockRecommendMenus();
  }
};

// 메뉴 옵션
export const fetchMenuOptions = async (): Promise<MenuOptionGroup[]> => {
  try {
    const res = await apiClient.get<MenuOptionGroup[]>('/menus/1/options');
    return res.data;
  } catch {
    return tempMockOptions();
  }
};
