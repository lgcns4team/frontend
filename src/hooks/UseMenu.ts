import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
import type { CategoryResponse, MenuItem } from '../types';

// 현재 시간에 맞춰서 MORNING / AFTERNOON / EVENING 반환
const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 17) return 'AFTERNOON';
  return 'EVENING';
};

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
  };
}
