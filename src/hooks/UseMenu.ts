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

    return category.menus.map((menu: any) => ({
      id: menu.menuId,
      name: menu.name,
      price: menu.price,

      // ✅ Order.tsx 필터가 보는 핵심 필드
      category: category.categoryName, // 예: '커피','음료','디저트'

      // (있으면 보관)
      categoryId: category.categoryId,
      categoryName: category.categoryName,

      img: menu.imageUrl || '',
      originalCategory: category.categoryName,
    }));
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

      // ✅ 추천 탭에 표시되게 고정
      category: '추천메뉴',

      // 원래 소속 카테고리(옵션 판단용)
      originalCategory: originalCategoryName,

      // 보관용
      categoryId: original?.categoryId ?? -1,
      categoryName: originalCategoryName,

      img: rec.imageUrl || original?.img || '',
    };
  });

  // ✅ Order.tsx가 items 하나만 써도 되게 합쳐서 내려줌
  const items: MenuItem[] = [...recommendedItems, ...basicItems];

  // -----------------------------
  // (C) 카테고리 탭 생성
  // -----------------------------
  const apiCategories = (menuQuery.data || []).map((c: any) => c.categoryName).filter(Boolean);

  const categories =
    apiCategories.length > 0 ? Array.from(new Set(['추천메뉴', ...apiCategories])) : CATEGORIES;

  return {
    items, // ✅ 추천+일반 합쳐진 리스트
    recommendedItems, // (원하면 별도로도 사용 가능)
    isLoading,
    categories,
    error,
  };
}
