import { create } from 'zustand';
import type { CartItem, MenuItem, Options } from '../types/OrderTypes';

interface CartState {
  cart: CartItem[];
  addToCart: (
    item: MenuItem, 
    options?: Partial<Options>, 
    quantity?: number,
    backendOptions?: { optionItemId: number; quantity: number; price: number; name: string }[] 
  ) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

// 옵션 비교 헬퍼 함수 (두 옵션 배열이 같은지 확인)
const areOptionsEqual = (opts1: any[], opts2: any[]) => {
  if (opts1.length !== opts2.length) return false;
  // ID 순서대로 정렬해서 문자열로 비교
  const sorted1 = [...opts1].sort((a, b) => a.optionItemId - b.optionItemId);
  const sorted2 = [...opts2].sort((a, b) => a.optionItemId - b.optionItemId);
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (item, options, quantity = 1, backendOptions = []) => {
    set((state) => {
      // 1. 이미 장바구니에 같은 메뉴 + 같은 옵션이 있는지 찾기
      const existingItemIndex = state.cart.findIndex(
        (cartItem) => 
          cartItem.id === item.id && 
          areOptionsEqual(cartItem.selectedBackendOptions, backendOptions)
      );

      // 2. 있다면 수량만 증가
      if (existingItemIndex !== -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += quantity;
        return { cart: newCart };
      }

      // 3. 없다면 새로 추가
      const newItem: CartItem = {
        ...item,
        cartId: Math.random().toString(36).substr(2, 9),
        quantity,
        options,
        selectedBackendOptions: backendOptions, 
      };

      return { cart: [...state.cart, newItem] };
    });
  },

  removeFromCart: (cartId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartId !== cartId),
    })),

  updateQuantity: (cartId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  getTotalPrice: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      const optionsPrice = item.selectedBackendOptions.reduce((acc, opt) => acc + opt.price, 0);
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  },
}));