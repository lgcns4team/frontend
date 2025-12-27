import { apiClient } from '../Lib/ApiClient';
import type { CategoryResponse, MenuItem, MenuOptionGroup } from '../types/OrderTypes';
import { tempMockCategories, tempMockRecommendMenus, tempMockOptions } from './tempmock';

const USE_MOCK = true; // 나중에 false로 바꾸면 API 사용

export const fetchMenus = async (): Promise<CategoryResponse[]> => {
  if (USE_MOCK) return tempMockCategories;

  const res = await apiClient.get<CategoryResponse[]>('/categories-with-menus');
  return res.data;
};

export const fetchRecommendMenus = async (): Promise<MenuItem[]> => {
  if (USE_MOCK) return tempMockRecommendMenus;

  const res = await apiClient.get<MenuItem[]>('/recommend-menus');
  return res.data;
};

export const fetchOptions = async (): Promise<MenuOptionGroup[]> => {
  if (USE_MOCK) return tempMockOptions;

  const res = await apiClient.get<MenuOptionGroup[]>('/menu-options');
  return res.data;
};
