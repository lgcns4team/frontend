// src/store/UseCartStore.ts
import { create } from 'zustand';
import type { CartItem, MenuItem, Options } from '../types/OrderTypes';

interface CartState {
  cart: CartItem[];

  addToCart: (item: MenuItem, options?: Partial<Options>, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;

  /**  옵션 변경(편집)용: 기존 cartId 항목 제거 + 새 옵션으로 재담기(동일 옵션 있으면 수량 합치기) */
  replaceCartOptions: (
    cartId: string,
    item: MenuItem,
    options: Partial<Options>,
    quantity?: number
  ) => void;

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

  addToCart: (item, options, quantity = 1) => {
    const normalizedOptions = options ?? undefined;
    const cartId = `${item.id}_${normalizedOptions ? JSON.stringify(normalizedOptions) : 'basic'}`;

    set((state) => {
      const existing = state.cart.find((i) => i.cartId === cartId);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        cart: [...state.cart, { ...item, cartId, quantity, options: normalizedOptions }],
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
      cart: state.cart
        .map((item) =>
          item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0),
    })),

  replaceCartOptions: (cartId, item, options, quantity = 1) =>
    set((state) => {
      // 1) 기존 항목 제거
      const filtered = state.cart.filter((i) => i.cartId !== cartId);

      // 2) 새 cartId 생성 (옵션 기반)
      const normalizedOptions = options ?? undefined;
      const newCartId = `${item.id}_${
        normalizedOptions ? JSON.stringify(normalizedOptions) : 'basic'
      }`;

      // 3) 동일 옵션 항목이 이미 있으면 수량 합치기
      const existing = filtered.find((i) => i.cartId === newCartId);
      if (existing) {
        return {
          cart: filtered.map((i) =>
            i.cartId === newCartId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }

      // 4) 없으면 새로 추가 (옵션 변경된 아이템)
      return {
        cart: [
          ...filtered,
          {
            ...item,
            cartId: newCartId,
            quantity,
            options: normalizedOptions,
          },
        ],
      };
    }),

  clearCart: () => set({ cart: [] }),

  getCartTotalPrice: () => get().cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));
