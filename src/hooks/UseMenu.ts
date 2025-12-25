import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
<<<<<<< HEAD
import type { MenuItem } from '../types/OrderTypes';
=======
import type { CategoryResponse, MenuItem } from '../types';
>>>>>>> origin/dev

const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 17) return 'AFTERNOON';
  return 'EVENING';
};

<<<<<<< HEAD
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
=======
function normalizeMenuItem(raw: any, fallbackCategory?: string): MenuItem | null {
  const id = Number(raw?.id);
  if (!Number.isFinite(id)) return null;

  const name = String(raw?.name ?? '');
  const price = Number(raw?.price ?? 0);
  const category = String(raw?.category ?? fallbackCategory ?? '');

  // 백엔드가 imageUrl을 주는 경우도 대비
  const img = String(raw?.img ?? raw?.imageUrl ?? '');

  return {
    id,
    name,
    price: Number.isFinite(price) ? price : 0,
    category,
    img,
    imageUrl: typeof raw?.imageUrl === 'string' ? raw.imageUrl : undefined,
    description: typeof raw?.description === 'string' ? raw.description : undefined,
    isSoldOut: typeof raw?.isSoldOut === 'boolean' ? raw.isSoldOut : undefined,
  };
}

// 기본 카테고리 (API 로딩 전이나 에러 시 사용)
export const CATEGORIES = ['추천메뉴', '커피', '음료', '디저트'];

export function useMenu() {
  const timeSlot = getCurrentTimeSlot();

  const menusQuery = useQuery({
    queryKey: ['menus', 'categories-with-menus'],
    queryFn: fetchMenus,
  });

  const recommendQuery = useQuery({
    queryKey: ['menus', 'recommend', timeSlot],
    queryFn: () => fetchRecommendMenus({ timeSlot, limit: 6 }),
  });

  const categoriesData: CategoryResponse[] = menusQuery.data ?? [];

  const basicItems = useMemo<MenuItem[]>(() => {
    const flattened: MenuItem[] = [];
    for (const category of categoriesData) {
      const categoryName = category?.name;
      const menus = Array.isArray(category?.menus) ? category.menus : [];
      for (const rawMenu of menus) {
        const normalized = normalizeMenuItem(rawMenu, categoryName);
        if (normalized) flattened.push(normalized);
      }
    }
    return flattened;
  }, [categoriesData]);

  const recommendedItems = useMemo<MenuItem[]>(() => {
    const raw = recommendQuery.data;
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
      .map((m) => normalizeMenuItem(m, m?.category))
      .filter((m): m is MenuItem => Boolean(m));

    // 추천 API가 아직 없거나 에러면 기본 메뉴에서 대체
    if (normalized.length === 0) return basicItems.slice(0, 6);
    return normalized;
  }, [recommendQuery.data, basicItems]);

  const items = useMemo(() => {
    // VoiceOrder에서 name 기준으로 찾는 경우가 있어 전체 목록을 제공
    return [...recommendedItems, ...basicItems];
  }, [recommendedItems, basicItems]);

  const categories = useMemo(() => {
    const categoryNames = categoriesData.map((c) => c.name).filter(Boolean);
    const unique = Array.from(new Set(categoryNames));
    return unique.length > 0 ? ['추천메뉴', ...unique] : CATEGORIES;
  }, [categoriesData]);

  return {
    items,
    basicItems,
    recommendedItems,
    isLoading: menusQuery.isLoading || recommendQuery.isLoading,
    categories,
    error: menusQuery.error ?? recommendQuery.error ?? null,
>>>>>>> origin/dev
  };
}
