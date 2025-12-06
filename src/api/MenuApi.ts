import type { MenuItem } from "../types/index";

// 임시 더미 데이터
const DUMMY_MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "아메리카노", price: 2000, category: "커피", img: "/iced-americano.jpg" },
  { id: 2, name: "카페라떼", price: 3000, category: "커피", img: "/iced-latte.png" },
  { id: 3, name: "바닐라 라떼", price: 3500, category: "커피", img: "/vanilla-latte.png" },
  { id: 4, name: "카라멜 마키아또", price: 4000, category: "커피", img: "/caramel-macchiato.png" },
  { id: 5, name: "복숭아 아이스티", price: 4000, category: "음료", img: "/peach-tea.png" },
  { id: 6, name: "치즈 케이크", price: 6000, category: "디저트", img: "/cheese-cake.png" },
  { id: 7, name: "초코 케이크", price: 5000, category: "디저트", img: "/choco-cake.png" },
];

// 실제 Axios 호출을 흉내내는 함수
export const fetchMenus = async (): Promise<MenuItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_MENU_ITEMS);
    }, 500); // 0.5초 딜레이 시뮬레이션
  });
};