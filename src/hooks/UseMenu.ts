import { useQuery } from '@tanstack/react-query';
import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
import type { MenuItem } from '../types/OrderTypes';

const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 17) return 'AFTERNOON';
  return 'EVENING';
};

export const CATEGORIES = ['추천메뉴', '커피', '음료', '디저트'];

export function useMenu() {
  const menuQuery = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  const recommendQuery = useQuery({
    queryKey: ['recommend', getCurrentTimeSlot()],
    queryFn: () =>
      fetchRecommendMenus({
        timeSlot: getCurrentTimeSlot(),
      }),
  });

  const isLoading = menuQuery.isLoading || recommendQuery.isLoading;
  const error = menuQuery.error || recommendQuery.error;

  // --- 데이터 변환 ---

  // (A) 추천 메뉴 변환 [여기를 수정했습니다!]
  // Swagger에 따르면 추천 메뉴는 name이 아니라 menuName, price가 아니라 basePrice입니다.
  const recommendedItems: MenuItem[] = (recommendQuery.data || []).map((item: any, index: number) => ({
    id: item.menuId ?? -(index + 10000),
    
    // [핵심 수정] 백엔드가 주는 이름표대로 연결
    name: item.menuName || item.name,    
    price: item.basePrice || item.price || 0,
    
    category: '추천메뉴',
    img: item.imageUrl || '', 
  }));

  // (B) 일반 메뉴 변환 (기존 유지)
  const basicItems: MenuItem[] = (menuQuery.data || []).flatMap((category) => {
    if (!category.menus) return [];
    return category.menus.map((menu, index) => ({
      id: menu.menuId ?? (index + 20000), 
      name: menu.name,
      price: menu.price,
      category: category.categoryName, 
      img: menu.imageUrl || '',        
    }));
  });

  const allItems = [...recommendedItems, ...basicItems];

  // (D) 카테고리 탭 자동 생성
  const apiCategories = menuQuery.data
    ?.map((c) => c.categoryName)
    .filter((name) => name) || [];
  
  const dynamicCategories = Array.from(new Set(['추천메뉴', ...apiCategories]));

  return {
    items: allItems,
    isLoading,
    categories: apiCategories.length > 0 ? dynamicCategories : CATEGORIES,
    error,
  };
}