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
      // [수정] 백엔드 이미지 경로를 로컬 public/images 경로로 변환
      // 예: "http://.../lemon_ade.png" 또는 "/images/menu/lemon_ade.png" -> "lemon_ade.png" 추출
      const fileName = menu.imageUrl ? menu.imageUrl.split('/').pop() : '';

      // 추출한 파일명을 이용해 로컬 경로 생성 (/images/lemon_ade.png)
      const localImageSrc = fileName ? `/menu_images/${fileName}` : '';

      return {
        id: menu.menuId,
        name: menu.name,
        price: menu.price,

        // ✅ Order.tsx 필터가 보는 핵심 필드
        category: category.categoryName, // 예: '커피','음료','디저트'

        // (있으면 보관)
        categoryId: category.categoryId,
        categoryName: category.categoryName,

        // [수정] 변환된 로컬 이미지 경로 적용
        img: localImageSrc || '',
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

    // [수정] 추천 메뉴 데이터에도 이미지가 있다면 동일하게 경로 변환
    const recFileName = rec.imageUrl ? rec.imageUrl.split('/').pop() : '';
    const recLocalImage = recFileName ? `/menu_images/${recFileName}` : '';

    return {
      id: menuId,
      name: rec.menuName ?? rec.name,
      price: rec.basePrice ?? rec.price ?? 0,

      //  추천 탭에 표시되게 고정
      category: '추천메뉴',

      // 원래 소속 카테고리(옵션 판단용)
      originalCategory: originalCategoryName,

      // 보관용
      categoryId: original?.categoryId ?? -1,
      categoryName: originalCategoryName,

      // [수정] 추천 메뉴 이미지가 있으면 쓰고, 없으면 원본(이미 변환됨) 사용
      img: recLocalImage || original?.img || '',
    };
  });

  const items: MenuItem[] = [
    ...recommendedItems,
    ...basicItems.filter((basic) => !recommendedItems.some((rec) => rec.id === basic.id)),
  ];

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
