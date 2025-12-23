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

// 옵션 비교 헬퍼 함수
const areOptionsEqual = (opts1: any[], opts2: any[]) => {
  if (opts1.length !== opts2.length) return false;
  const sorted1 = [...opts1].sort((a, b) => a.optionItemId - b.optionItemId);
  const sorted2 = [...opts2].sort((a, b) => a.optionItemId - b.optionItemId);
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (item, options, quantity = 1, backendOptions = []) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        (cartItem) => 
          cartItem.id === item.id && 
          areOptionsEqual(cartItem.selectedBackendOptions, backendOptions)
      );

      if (existingItemIndex !== -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += quantity;
        return { cart: newCart };
      }

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

  // [수정 핵심] 옵션 가격 계산 시 '수량'을 곱해줍니다!
  getTotalPrice: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      // (기존) acc + opt.price  ->  (수정) acc + (opt.price * opt.quantity)
      const optionsPrice = item.selectedBackendOptions.reduce(
        (acc, opt) => acc + (opt.price * opt.quantity), 
        0
      );
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  },
}));