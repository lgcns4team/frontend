// import { useQuery } from '@tanstack/react-query';
// import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
import type { MenuItem } from '../types/index';

// 현재 시간에 맞춰서 MORNING / AFTERNOON / EVENING 반환
const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'MORNING'; // 아침 6시~11시
  if (hour >= 11 && hour < 17) return 'AFTERNOON'; // 점심 11시~17시
  return 'EVENING'; // 저녁 17시 이후
};

// 기본 카테고리 (API 로딩 전이나 에러 시 사용)
export const CATEGORIES = ['추천메뉴', '커피', '음료', '디저트'];

export function useMenu() {
  // 1. 전체 메뉴 불러오기 (API 사용)
  // const menuQuery = useQuery({
  //   queryKey: ['menus'],
  //   queryFn: fetchMenus,
  // });

  // 2. 추천 메뉴 불러오기 (API 사용)
  // const recommendQuery = useQuery({
  //   queryKey: ['recommend', getCurrentTimeSlot()], // 시간대가 바뀌면 다시 호출
  //   queryFn: () =>
  //     fetchRecommendMenus({
  //       timeSlot: getCurrentTimeSlot(),
  //       // 추후 얼굴 인식 결과가 있으면 여기에 넣으세요 (예: gender: 'MALE')
  //     }),
  // });

  // 임시 데이터 (백엔드 준비 시까지)
  const isLoading = false;
  const error = null;
  const menuQuery = { data: [] };
  const recommendQuery = { data: [] };

  // --- 데이터 합치기 (Data Mapping) - 백엔드 연결 시 활성화 ---

  // (A) 추천 메뉴 리스트: 카테고리를 '추천메뉴'로 강제 지정 (API 사용)
  // const recommendedItems: MenuItem[] = (recommendQuery.data || []).map((item) => ({
  //   ...item,
  //   category: '추천메뉴',
  //   img: item.imageUrl || item.img || '',
  // }));

  // (B) 일반 메뉴 리스트: 카테고리별 묶음을 풀어서 일자형 배열로 변환 (API 사용)
  // const basicItems: MenuItem[] = (menuQuery.data || []).flatMap((category) =>
  //   category.menus.map((menu) => ({
  //     ...menu,
  //     category: category.name, // 백엔드에서 온 카테고리 이름 (커피, 음료 등)
  //     img: menu.imageUrl || menu.img || '',
  //   }))
  // );

  // 현재 임시 사용: 빈 배열 (백엔드 준비 후 위의 주석 해제)
  const recommendedItems: MenuItem[] = [];
  const basicItems: MenuItem[] = [];

  // (C) 최종 전체 리스트 (추천 + 일반)
  const allItems = [...recommendedItems, ...basicItems];

  // (D) 카테고리 탭 목록 만들기 (추천메뉴 + API에서 온 카테고리들) - 백엔드 연결 시 활성화
  // const apiCategories = menuQuery.data?.map((c) => c.name) || [];
  // const dynamicCategories = ['추천메뉴', ...apiCategories];

  // 현재 임시 사용: 기본 카테고리 사용
  const dynamicCategories = CATEGORIES;

  return {
    items: allItems, // 화면에 뿌려질 최종 메뉴 리스트
    isLoading,
    categories: dynamicCategories, // 백엔드 연결 시 동적으로 변경됨
    error,
  };
}
