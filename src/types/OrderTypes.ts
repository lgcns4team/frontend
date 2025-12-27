

// ----------------------------------------------------------------------
// 1. 프론트엔드 내부용 (화면 표시용)
// ----------------------------------------------------------------------
export interface MenuItem {
  id: number;       // 화면용 ID (백엔드 menuId를 매핑)
  name: string;
  price: number;
  category: string; // 화면용 카테고리명 (백엔드 categoryName을 매핑)
  img: string;      // 화면용 이미지 주소 (백엔드 imageUrl을 매핑)
  originalCategory?: string;
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
  menuId: number;        // 백엔드는 menuId를 씀
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  isActive: boolean;
  imageUrl: string;      // 백엔드는 imageUrl을 씀
}

// 카테고리 1개 데이터 (백엔드 모양)
export interface BackendCategory {
  categoryId: number;    // 백엔드는 categoryId를 씀
  categoryName: string;  // 백엔드는 categoryName을 씀
  displayOrder: number;
  menus: BackendMenu[];
  menuCount: number;
}

export interface BackendOptionItem {
  optionItemId: number;   // 프론트는 id
  name: string;
  optionPrice: number;    // 프론트는 price
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
  temperature: "hot" | "cold";
  size: "tall" | "grande" | "venti";
  ice: "less" | "normal" | "more";
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


// ==========================================================
//  주문 생성 API (POST /api/orders) 관련 타입
// ==========================================================

// 1. 주문 요청 시 선택한 옵션 구조
export interface OrderOptionRequest {
  optionItemId: number; // 옵션 ID (필수)
  quantity: number;     // 수량
}

// 2. 주문 요청 시 개별 메뉴 구조
export interface OrderItemRequest {
  menuId: number;       // 메뉴 ID (필수)
  quantity: number;     // 수량
  selectedOptions: OrderOptionRequest[]; // 선택된 옵션 리스트
}

// 3. 주문 생성 요청 전체 Body (Swagger Request Body)
export interface CreateOrderRequest {
  storeId: number;
  sessionId: number;

  orderItems: OrderItemRequest[];
  
  orderType: string;       // DB: 'dine-in' | 'takeout'
  paymentMethod: string;   // DB: '카드결제' | '네이버페이' ...
  pgTransactionId: string;

  totalAmount: number;
  expectedTotalAmount?: number; // 백엔드 검증용 필드
  
  // 스웨거에는 있고 DB에는 없을 수 있지만, API 규격상 필요하다면 유지
  ageGroup?: string;
  gender?: string;
  isSeniorMode?: boolean;
}

// 4. [신규] 주문 검증 응답 타입 (verifyOrder 응답)
export interface OrderVerificationResponse {
  isValid: boolean;
  calculatedTotalAmount: number;
  expectedTotalAmount: number | null;
  priceDifference: number;
  errorMessage?: string;
}

// 5. [수정됨] 주문 생성 성공 응답 (백엔드 JSON 양식 반영)
export interface OrderResponseOption {
  optionName: string;
  extraPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponseItem {
  orderItemId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  options: OrderResponseOption[]; // 기존 string[]에서 상세 객체 배열로 변경
}

// 5. 주문 생성 성공 응답 (Swagger Response)
export interface OrderResponse {
  orderId: number;
  orderNo: number;
  orderType: string;
  totalAmount: number;
  orderedAt: string;
  paidAt: string;
  paymentMethod: string;
  paymentStatus: string;  // [신규]
  status: number;         // [변경] string -> number (예시가 0이므로)
  
  ageGroup: string;       // [신규]
  gender: string;         // [신규]
  timeSlot: string;       // [신규]
  
  orderItems: OrderResponseItem[];
}