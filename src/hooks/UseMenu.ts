// import { useQuery } from '@tanstack/react-query';
// import { fetchMenus, fetchRecommendMenus } from '../api/MenuApi';
import type { MenuItem } from '../types/index';

// [임시] handlers.ts의 메뉴 데이터 직접 사용
const tempMenuData = [
  { id: 1, name: '아메리카노', price: 4500, category: '커피', img: '/raw/menu_ice_americano.jpg' },
  { id: 2, name: '카페라떼', price: 5000, category: '커피', img: '/raw/menu_cafe_latte.jpg' },
  { id: 3, name: '바닐라라떼', price: 5500, category: '커피', img: '/raw/menu_vanilla_latte.jpg' },
  {
    id: 4,
    name: '딸기스무디',
    price: 6000,
    category: '음료',
    img: '/raw/menu_straw_latte.jpg',
  },
  { id: 5, name: '캐모마일 티', price: 4800, category: '음료', img: '/raw/menu_chamomile.jpg' },
  {
    id: 6,
    name: '얼그레이 티',
    price: 4800,
    category: '음료',
    img: '/raw/menu_peach_ice_tea.jpg',
  },
  { id: 11, name: '페퍼민트 티', price: 5000, category: '음료', img: '/raw/menu_peppermint.jpg' },
  { id: 12, name: '캐모마일 티', price: 5000, category: '음료', img: '/raw/menu_chamomile.jpg' },
  {
    id: 7,
    name: '치즈케이크 디저트',
    price: 6500,
    category: '푸드',
    img: '/raw/menu_cheese_cake.jpg',
  },
  {
    id: 8,
    name: '초코 브라우니 디저트',
    price: 5800,
    category: '푸드',
    img: '/raw/menu_choco_cake.jpg',
  },
  {
    id: 9,
    name: '햄치즈 샌드위치',
    price: 7200,
    category: '푸드',
    img: '/raw/menu_salt_bread.jpg',
  },
];

// [API 연결 시 활성화]
// const getCurrentTimeSlot = () => {
//   const hour = new Date().getHours();
//   if (hour >= 6 && hour < 11) return 'MORNING';
//   if (hour >= 11 && hour < 17) return 'AFTERNOON';
//   return 'EVENING';
// };

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

  // [임시] 메뉴 데이터를 임시로 직접 사용
  const recommendedItems: MenuItem[] = tempMenuData.map((item) => ({
    ...item,
    category: '추천메뉴',
  }));

  const basicItems: MenuItem[] = tempMenuData.map((item) => ({
    ...item,
  }));

  // (C) 최종 전체 리스트 (추천 + 일반)
  const allItems = [...recommendedItems, ...basicItems];

  // (D) 카테고리 탭 목록 만들기
  // 임시: 데이터에서 동적으로 카테고리 추출 (추천메뉴 + 기타)
  const uniqueCategories = Array.from(
    new Set(basicItems.map((item) => item.category).filter((cat) => cat !== '추천메뉴'))
  );
  const dynamicCategories = ['추천메뉴', ...uniqueCategories];

  return {
    items: allItems, // 화면에 뿌려질 최종 메뉴 리스트
    isLoading,
    categories: dynamicCategories, // 백엔드 연결 시 동적으로 변경됨
    error,
  };
}
