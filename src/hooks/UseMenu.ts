import { useQuery } from '@tanstack/react-query';
import { fetchMenus } from '../api/MenuApi';
import type { MenuItem } from '../types/index';

export const CATEGORIES = ['추천메뉴', '커피', '음료', '디저트'];

export function useMenu() {
  const { data, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  return {
    items: data || [],
    isLoading,
    categories: CATEGORIES,
    error,
  };
}
