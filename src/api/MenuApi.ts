import { apiClient } from '../Lib/ApiClient';
import type { MenuItem } from '../types/index';

export const fetchMenus = async (): Promise<MenuItem[]> => {
  const res = await apiClient.get('/menus');
  return res.data;
};
