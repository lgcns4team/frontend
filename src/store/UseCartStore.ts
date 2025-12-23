import { create } from 'zustand';
import type { CartItem, MenuItem, Options } from '../types/OrderTypes';

interface CartState {
  cart: CartItem[];
  
  // 장바구니 추가 (백엔드 옵션 데이터 포함)
  addToCart: (
    item: MenuItem, 
    options?: Partial<Options>, 
    quantity?: number,
    // 백엔드 전송용 옵션 데이터 (선택 사항)
    backendOptions?: { optionItemId: number; quantity: number; price: number; name: string }[] 
  ) => void;

  // 장바구니 삭제
  removeFromCart: (cartId: string) => void;

  // [수정] 수량 변경 함수 (이게 없어서 에러가 났습니다!)
  updateQuantity: (cartId: string, quantity: number) => void;

  // 장바구니 비우기
  clearCart: () => void;

  // 총 금액 계산
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (item, options, quantity = 1, backendOptions = []) => {
    set((state) => {
      const newItem: CartItem = {
        ...item,
        // 고유 ID 생성
        cartId: Math.random().toString(36).substr(2, 9), 
        quantity,
        options,
        // 백엔드 전송용 데이터 저장
        selectedBackendOptions: backendOptions, 
      };

      return { cart: [...state.cart, newItem] };
    });
  },

  removeFromCart: (cartId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartId !== cartId),
    })),

  // [추가됨] 수량 업데이트 로직
  updateQuantity: (cartId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, quantity) } // 1개 미만으로 내려가지 않게 방지
          : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  getTotalPrice: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      // 옵션 가격 총합
      const optionsPrice = item.selectedBackendOptions 
        ? item.selectedBackendOptions.reduce((acc, opt) => acc + opt.price, 0)
        : 0;
        
      // (기본가격 + 옵션가격) * 수량
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  },
}));