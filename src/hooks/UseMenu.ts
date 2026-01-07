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

// fallback(응답 없을 때만)
export const CATEGORIES = ['추천메뉴', '커피', '음료', '디저트', '브랜치', '베이커리'];

export function useMenu() {
  const menuQuery = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  const timeSlot = getCurrentTimeSlot();
  const recommendQuery = useQuery({
    queryKey: ['recommend', timeSlot],
    queryFn: () => fetchRecommendMenus({ timeSlot }),
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
  // (B) 추천 메뉴 변환 + 보정
  // -----------------------------
  const recommendedItems: MenuItem[] = (recommendQuery.data || []).map((rec: any) => {
    const menuId = rec.menuId;
    const original = basicItems.find((m) => m.id === menuId);

    const originalCategoryName =
      rec.categoryName || original?.categoryName || original?.category || '기타';

   

    return {
      id: menuId,
      name: rec.menuName ?? rec.name,
      price: rec.basePrice ?? rec.price ?? 0,

      category: '추천메뉴',
      originalCategory: originalCategoryName,

   
      categoryId: original?.categoryId ?? -1,
      categoryName: originalCategoryName,

   
      img: rec.image_Url || original?.img || '',
    };
  });


  const items: MenuItem[] = [
    ...recommendedItems,
    ...basicItems,
  ];

  // -----------------------------
  // (C) 카테고리 탭 생성
  // -----------------------------
  const apiCategories = (menuQuery.data || []).map((c: any) => c.categoryName).filter(Boolean);

  const categories =
    apiCategories.length > 0 ? Array.from(new Set(['추천메뉴', ...apiCategories])) : CATEGORIES;

  return {
    items, 
    recommendedItems,
    isLoading,
    categories,
    error,
  };
}
