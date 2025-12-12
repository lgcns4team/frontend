import { http, HttpResponse } from 'msw';

const allMenus = [
  { id: 1, name: '아메리카노', price: 4500, category: '커피', img: '/raw/menu_ice_americano.jpg' },
  { id: 2, name: '카페라떼', price: 5000, category: '커피', img: '/raw/menu_cafe_latte.jpg' },
  { id: 3, name: '바닐라라떼', price: 5500, category: '커피', img: '/raw/menu_vanilla_latte.jpg' },
  {
    id: 4,
    name: '딸기스무디',
    price: 6000,
    category: '음료',
    img: '/raw/menu_straw_latte.jpg', // 딸기 사진
  },

  { id: 5, name: '캐모마일 티', price: 4800, category: '음료', img: '/raw/menu_chamomile.jpg' },
  {
    id: 6,
    name: '얼그레이 티',
    price: 4800,
    category: '음료',
    img: '/raw/menu_peach_ice_tea.jpg', // 얼그레이용 이미지 없으니 티 사진 중 하나 사용
  },

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
    img: '/raw/menu_salt_bread.jpg', // 샌드위치 대신 빵 이미지
  },
];

export const handlers = [http.get('/api/menus', () => HttpResponse.json(allMenus))];
