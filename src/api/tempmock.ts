// ❗임시 확인용 – 나중에 통째로 삭제
import type { CategoryResponse, MenuItem, MenuOptionGroup } from '../types/OrderTypes';

export const tempMockCategories: CategoryResponse[] = [
  {
    categoryId: 1,
    categoryName: '커피',
    menus: [
      { id: 1, name: '아메리카노', price: 4500, imageUrl: '', isSoldOut: false, isActive: true },
      { id: 2, name: '카페라떼', price: 5000, imageUrl: '', isSoldOut: false, isActive: true },
    ],
  },
  {
    categoryId: 2,
    categoryName: '음료',
    menus: [
      { id: 3, name: '레몬티', price: 4800, imageUrl: '', isSoldOut: false, isActive: true },
      { id: 4, name: '딸기 스무디', price: 5500, imageUrl: '', isSoldOut: false, isActive: true },
    ],
  },
  {
    categoryId: 3,
    categoryName: '디저트',
    menus: [
      { id: 5, name: '초코 케이크', price: 4800, imageUrl: '', isSoldOut: false, isActive: true },
    ],
  },
];

//  옵션 목업
export const tempMockOptions: MenuOptionGroup[] = [
  {
    groupId: 1,
    groupName: '온도',
    required: true,
    options: [
      { id: 1, name: 'HOT', price: 0 },
      { id: 2, name: 'ICE', price: 0 },
    ],
  },
  {
    groupId: 2,
    groupName: '사이즈',
    required: false,
    options: [
      { id: 3, name: 'Small', price: 0 },
      { id: 4, name: 'Large', price: 500 },
    ],
  },
];
