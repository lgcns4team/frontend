import type { CategoryResponse, MenuItem, MenuOptionGroup } from '../types/OrderTypes';

// 카테고리 + 메뉴 목업
export const tempMockCategories: CategoryResponse[] = [
  {
    id: 1,
    name: '커피',
    menus: [
      { id: 1, name: '아메리카노', price: 4500, category: '커피', img: '' },
      { id: 2, name: '카페라떼', price: 5000, category: '커피', img: '' },
    ],
  },
  {
    id: 2,
    name: '음료',
    menus: [
      { id: 3, name: '레몬티', price: 4800, category: '음료', img: '' },
      { id: 4, name: '딸기 스무디', price: 5500, category: '음료', img: '' },
    ],
  },
];

// 추천 메뉴 목업 (MenuApi.ts에서 import하는 이름이랑 동일해야 함)
export const tempMockRecommendMenus: MenuItem[] = [
  { id: 1, name: '아메리카노', price: 4500, category: '커피', img: '' },
  { id: 4, name: '딸기 스무디', price: 5500, category: '음료', img: '' },
];

// 옵션 그룹 목업
export const tempMockOptions: MenuOptionGroup[] = [
  {
    id: 1,
    name: '온도',
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 1, name: 'HOT', price: 0 },
      { id: 2, name: 'ICE', price: 0 },
    ],
  },
  {
    id: 2,
    name: '샷',
    minSelect: 0,
    maxSelect: 2,
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '샷 2개 추가', price: 1000 },
    ],
  },
];
