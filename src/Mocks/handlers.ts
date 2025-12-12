import { http, HttpResponse } from 'msw';
import type { MenuItem } from '../types/index';

const DUMMY_MENU_ITEMS: MenuItem[] = [
  // 커피
  { id: 1, name: '아메리카노', price: 4000, category: '커피', img: '/raw/menu_ice_americano.jpg' },
  { id: 2, name: '카페라떼', price: 5000, category: '커피', img: '/raw/menu_cafe_latte.jpg' },
  { id: 3, name: '바닐라 라떼', price: 5000, category: '커피', img: '/raw/menu_vanilla_latte.jpg' },
  { id: 4, name: '카라멜 라떼', price: 5000, category: '커피', img: '/raw/menu_caramel_latte.jpg' },
  { id: 5, name: '초코 라떼', price: 5000, category: '커피', img: '/raw/menu_choco_latte.jpg' },
  { id: 6, name: '딸기 라떼', price: 6000, category: '커피', img: '/raw/menu_straw_latte.jpg' },
  {
    id: 7,
    name: '솔티드 카라멜 라떼',
    price: 6000,
    category: '커피',
    img: '/raw/menu_salted_caramell_latte.jpg',
  },
  { id: 8, name: '에스프레소', price: 4000, category: '커피', img: '/raw/menu_esspresso.jpg' },
  { id: 9, name: '아포가토', price: 6500, category: '디저트', img: '/raw/menu_affogato.jpg' },

  // 음료
  {
    id: 10,
    name: '복숭아 아이스티',
    price: 4000,
    category: '음료',
    img: '/raw/menu_peach_ice_tea.jpg',
  },
  { id: 11, name: '페퍼민트 티', price: 5000, category: '음료', img: '/raw/menu_peppermint.jpg' },
  { id: 12, name: '캐모마일 티', price: 5000, category: '음료', img: '/raw/menu_chamomile.jpg' },

  // 디저트
  {
    id: 13,
    name: '치즈 케이크',
    price: 6000,
    category: '디저트',
    img: '/raw/menu_cheese_cake.jpg',
  },
  { id: 14, name: '초코 케이크', price: 5500, category: '디저트', img: '/raw/menu_choco_cake.jpg' },
  {
    id: 15,
    name: '레인보우 케이크',
    price: 6500,
    category: '디저트',
    img: '/raw/menu_rainbow_cake.jpg',
  },
  { id: 16, name: '소금빵', price: 3500, category: '디저트', img: '/raw/menu_salt_bread.jpg' },
];

export const handlers = [
  http.get('/api/menus', () => {
    return HttpResponse.json(DUMMY_MENU_ITEMS);
  }),
];
