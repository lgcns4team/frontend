// src/hooks/UseMenu.ts
import { useQuery } from '@tanstack/react-query';
import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
import type { MenuItem } from '../types/OrderTypes';

const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 17) return 'AFTERNOON';
  return 'EVENING';
};



export function useMenu(gender?: string, ageGroup?: string) {
  const menuQuery = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  const timeSlot = getCurrentTimeSlot();
  const recommendQuery = useQuery({
    queryKey: ['recommend', gender, ageGroup], 
    queryFn: () => fetchRecommendMenus({ 
      timeSlot, 
      gender, 
      ageGroup,
      limit: 10
    }),
  });

  const isLoading = menuQuery.isLoading || recommendQuery.isLoading;
  const error = menuQuery.error || recommendQuery.error;

  // -----------------------------
  // (A) 일반 메뉴 변환
  // -----------------------------
  const basicItems: MenuItem[] = (menuQuery.data || []).flatMap((category: any) => {
    if (!category?.menus) return [];


    return category.menus.map((menu: any) => {
      return {
        id: menu.menuId,
        name: menu.name,
        price: menu.price,

        category: category.categoryName,


        categoryId: category.categoryId,
        categoryName: category.categoryName,

     
        img: menu.imageUrl || '',

        originalCategory: category.categoryName,
      };
    });
  });

  // -----------------------------
  // (B) 추천 메뉴 변환
  // -----------------------------
  const apiRecommendedItems: MenuItem[] = (recommendQuery.data || []).map((rec: any) => {
    const menuId = rec.menuId;
    const original = basicItems.find((m) => m.id === menuId);
    const originalCategoryName = rec.categoryName || original?.categoryName || '기타';

    return {
      id: menuId,
      name: rec.menuName ?? original?.name ?? '',
      price: rec.basePrice ?? original?.price ?? 0,
      category: '추천메뉴',
      originalCategory: originalCategoryName,
      categoryId: original?.categoryId ?? -1,
      categoryName: originalCategoryName,
      img: rec.imageUrl || original?.img || '',
    };
  });

  // -----------------------------
  // (C) 추천 메뉴 10개 보충
  // -----------------------------
  let recommendedItems = [...apiRecommendedItems];
  
  if (recommendedItems.length < 10) {
    const recommendedMenuIds = new Set(recommendedItems.map(item => item.id));
    
    // 추천 메뉴에 없는 일반 메뉴 필터링
    const remainingItems = basicItems.filter(
      item => !recommendedMenuIds.has(item.id)
    );
    
    // 부족한 개수만큼 추가
    const needed = 10 - recommendedItems.length;
    const additionalItems = remainingItems.slice(0, needed).map(item => ({
      ...item,
      category: '추천메뉴',
    }));
    
    recommendedItems = [...recommendedItems, ...additionalItems];
  }

  const items: MenuItem[] = [...recommendedItems, ...basicItems];


  // -----------------------------
  // (D) 카테고리 탭 생성
  // -----------------------------
  const apiCategories = (menuQuery.data || []).map((c: any) => c.categoryName).filter(Boolean);

  const categories =
    apiCategories.length > 0 ? Array.from(new Set(['추천메뉴', ...apiCategories])) : [];

  return {
    items, 
    recommendedItems,
    isLoading,
    categories,
    error,
  };
}
