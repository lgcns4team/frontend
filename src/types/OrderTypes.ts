// ----------------------------------------------------------------------
// 1. 프론트엔드 내부용 (화면 표시용)
// ----------------------------------------------------------------------
export interface MenuItem {
  id: number; // 화면용 ID (백엔드 menuId를 매핑)
  name: string;
  price: number;
  category: string; // 프론트엔드 분류용
  img: string; // 화면 표시용 이미지
  // 백엔드에서 올 수 있는 추가 필드들 (선택사항)
  imageUrl?: string;
  description?: string;
  isSoldOut?: boolean;
}

export type CartItem = MenuItem & {
  cartId: string;
  quantity: number;

  selectedBackendOptions: {
    optionItemId: number;
    quantity: number;
    price: number;
    name: string;
  }[];
  options?: any;
};

// ----------------------------------------------------------------------
// 2. 백엔드 API 응답용 (실제 서버 데이터 모양)
// ----------------------------------------------------------------------

// 메뉴 1개 데이터 (백엔드 모양)
export interface BackendMenu {
  menuId: number; // 백엔드는 menuId를 씀
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  isActive: boolean;
  imageUrl: string; // 백엔드는 imageUrl을 씀
}

// 카테고리 1개 데이터 (백엔드 모양)
export interface BackendCategory {
  categoryId: number; // 백엔드는 categoryId를 씀
  categoryName: string; // 백엔드는 categoryName을 씀
  displayOrder: number;
  menus: BackendMenu[];
  menuCount: number;
}

export interface BackendOptionItem {
  optionItemId: number; // 프론트는 id
  name: string;
  optionPrice: number; // 프론트는 price
}

// 2. 옵션 그룹 (온도, 사이즈 등)
export interface BackendOptionGroup {
  optionGroupId: number;
  name: string;
  isRequired: boolean;
  selectionType: 'SINGLE' | 'MULTI'; // Swagger: selectionType
  options: BackendOptionItem[];
}

// 3. 옵션 API 전체 응답 (껍데기)
export interface MenuOptionsResponse {
  menuId: number;
  menuName: string;
  basePrice: number;
  optionGroups: BackendOptionGroup[];
}

// API 전체 응답 (껍데기)
export interface MenuApiResponse {
  categories: BackendCategory[];
  totalCategories: number;
  maxMenusPerCategory: number;
}

// ----------------------------------------------------------------------
// 3. 옵션 관련 타입 (기존 유지)
// ----------------------------------------------------------------------
export interface MenuOptionDetail {
  id: number;
  name: string;
  price: number;
}

export interface MenuOptionGroup {
  id: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: MenuOptionDetail[];
}

export type Options = {
  temperature: 'hot' | 'cold';
  size: 'tall' | 'grande' | 'venti';
  ice: 'less' | 'normal' | 'more';
  shot: number;
  whip: boolean;
  isWeak: boolean;
};

export interface RecommendResponse {
  timeSlot: string;
  recommendType: string;
  totalCount: number;
  recommendedMenus: BackendMenu[]; // 여기가 핵심! 메뉴들이 이 안에 들어있음
}
