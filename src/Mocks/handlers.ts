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
    img: '/raw/menu_peach_ice_tea.jpg',
  },
  { id: 11, name: '페퍼민트 티', price: 5000, category: '음료', img: '/raw/menu_peppermint.jpg' },
  { id: 12, name: '캐모마일 티', price: 5000, category: '음료', img: '/raw/menu_chamomile.jpg' },

  // 디저트
  {
    id: 7,
    name: '치즈케이크 디저트',
    price: 6500,
    category: '디저트',
    img: '/raw/menu_cheese_cake.jpg',
  },
  {
    id: 8,
    name: '초코 브라우니 디저트',
    price: 5800,
    category: '디저트',
    img: '/raw/menu_choco_cake.jpg',
  },
  {
    id: 9,
    name: '햄치즈 샌드위치',
    price: 7200,
    category: '디저트',
    img: '/raw/menu_salt_bread.jpg', // 샌드위치 대신 빵 이미지
  },
];

// --- Advertisement mocks ---
// NOTE: This endpoint matches the backend schema used by the front-end:
// { ads: Ad[], totalCount: number }
const mockAds = [
  {
    adId: 101,
    title: 'Kiosk Ad #1',
    mediaType: 'IMAGE' as const,
    mediaUrl: '/ads/ad-1.jpg',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    adId: 102,
    title: 'Kiosk Ad #2',
    mediaType: 'IMAGE' as const,
    mediaUrl: '/ads/ad-2.jpg',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    adId: 103,
    title: 'Kiosk Ad #3',
    mediaType: 'IMAGE' as const,
    mediaUrl: '/ads/ad-3.jpg',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
];

export const handlers = [
  http.get('/api/menus', () => HttpResponse.json(allMenus)),
  http.get('/api/ads', () => {
    return HttpResponse.json({
      ads: mockAds,
      totalCount: mockAds.length,
    });
  }),
  http.post('/api/ads/display-log', async ({ request }) => {
    // Keep minimal validation; backend-like behavior is OK for dev.
    // Body example: { adId, displayedAt: 'YYYY-MM-DDTHH:mm:ss', durationMs }
    try {
      const body = await request.json();
      // eslint-disable-next-line no-console
      console.log('[MSW] ad display log:', body);
    } catch {
      // ignore
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
