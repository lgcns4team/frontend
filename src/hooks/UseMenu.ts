
import { useQuery } from '@tanstack/react-query';
import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
import type { MenuItem } from '../types/OrderTypes';

const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 17) return 'AFTERNOON';
  return 'EVENING';
};

export const CATEGORIES = ['추천메뉴', '커피', '음료', '디저트', '브랜치', '베이커리'];

export function useMenu() {
  // 1. 전체 메뉴 조회 (원본 데이터)
  const menuQuery = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  // 2. 추천 메뉴 조회
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

  // (A) 일반 메뉴 변환 (먼저 만듭니다. 기준 데이터가 되기 때문입니다.)
  const basicItems: MenuItem[] = (menuQuery.data || []).flatMap((category) => {
    if (!category.menus) return [];
    return category.menus.map((menu, index) => ({
      id: menu.menuId ?? (index + 20000), 
      name: menu.name,
      price: menu.price,
      category: category.categoryName, 
      // [수정 포인트 1] 일반 메뉴에도 'originalCategory'를 확실히 넣어줍니다.
      originalCategory: category.categoryName, 
      img: menu.imageUrl || '',        
    }));
  });

  // (B) 추천 메뉴 1차 변환 (API 데이터 기반)
  const rawRecommendedItems: MenuItem[] = (recommendQuery.data || []).map((item: any, index: number) => ({
    id: item.menuId ?? -(index + 10000),
    name: item.menuName || item.name,    
    price: item.basePrice || item.price || 0,
    category: '추천메뉴', // 화면에 보여줄 탭 이름
    // API가 categoryName을 주면 쓰고, 없으면 일단 비워둡니다.
    originalCategory: item.categoryName || '', 
    img: item.imageUrl || '', 
  }));

  // (C) 추천 메뉴 보정 (빈 카테고리 채우기)
  // 추천 API가 카테고리를 안 알려주면, 위에서 만든 basicItems(일반 메뉴)에서 이름을 검색해 찾아냅니다.
  const enhancedRecommendedItems = rawRecommendedItems.map(recItem => {
    // 이름이 같은 일반 메뉴 찾기
    const original = basicItems.find(basic => basic.name === recItem.name);
    
    // 1순위: 추천 API가 준 카테고리
    // 2순위: 이름으로 찾은 일반 메뉴의 카테고리
    // 3순위: 그래도 없으면 '기타'
    return {
      ...recItem,
      originalCategory: recItem.originalCategory || original?.originalCategory || '기타'
    };
  });

  // (D) 최종 합치기
  const allItems = [...enhancedRecommendedItems, ...basicItems];

  // (E) 카테고리 탭 자동 생성
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
