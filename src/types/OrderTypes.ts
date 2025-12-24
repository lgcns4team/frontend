// src/types/OrderTypes.ts

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string; // 프론트엔드 분류용
  img: string; // 화면 표시용 이미지
  // 백엔드에서 올 수 있는 추가 필드들 (선택사항)
  imageUrl?: string;
  description?: string;
  isSoldOut?: boolean;
};

// [신규] 옵션 상세 정보 (예: "샷 추가", "바닐라 시럽")
export interface MenuOptionDetail {
  id: number;
  name: string;
  price: number; // 추가 금액
}

// [신규] 옵션 그룹 정보 (예: "온도", "사이즈", "샷")
export interface MenuOptionGroup {
  id: number;
  name: string; // 그룹명 (이걸로 화면 표시 여부 결정)
  minSelect: number; // 최소 선택 개수 (필수 여부 체크용)
  maxSelect: number; // 최대 선택 개수
  options: MenuOptionDetail[]; // 선택지 리스트
}

// ... 기존 Options, CartItem, CategoryResponse 타입 유지 ...
export type Options = {
  temperature: 'hot' | 'cold';
  size: 'tall' | 'grande' | 'venti';
  ice: 'less' | 'normal' | 'more';
  shot: number;
  whip: boolean;
  isWeak: boolean;
};

export type CartItem = MenuItem & {
  cartId: string;
  quantity: number;
  options?: Partial<Options>;
};

export interface CategoryResponse {
  id: number;
  name: string;
  menus: MenuItem[];
}
