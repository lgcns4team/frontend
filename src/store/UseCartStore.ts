import { create } from 'zustand';
import type { CartItem, MenuItem, Options } from '../types/OrderTypes';

interface CartState {
  cart: CartItem[];
  addToCart: (
    item: MenuItem,
    options?: Partial<Options>,
    quantity?: number,
    // (4) 선택된 옵션 (가격 계산용)
    backendOptions?: { optionItemId: number; quantity: number; price: number; name: string }[],
    // (5) [추가] 전체 옵션 정보 (수정창용)
    fullOptionGroups?: any[] 
  ) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  updateCartOptions: (cartId: string, options: Partial<Options>) => void;
}

const areOptionsEqual = (opts1: any[], opts2: any[]) => {
  if (!opts1 || !opts2) return false;
  if (opts1.length !== opts2.length) return false;
  const sorted1 = [...opts1].sort((a, b) => a.optionItemId - b.optionItemId);
  const sorted2 = [...opts2].sort((a, b) => a.optionItemId - b.optionItemId);
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

const getTemp = (opts?: Partial<Options>) => opts?.temperature ?? null;
const areEasyOptionsEqual = (a?: Partial<Options>, b?: Partial<Options>) => {
  return getTemp(a) === getTemp(b);
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  // ✅ 5번째 인자 fullOptionGroups 추가
  addToCart: (item, options, quantity = 1, backendOptions = [], fullOptionGroups = []) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          areOptionsEqual(cartItem.selectedBackendOptions, backendOptions) &&
          areEasyOptionsEqual(cartItem.options, options)
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
        selectedBackendOptions: backendOptions, // 가격 계산용 (선택된 것)
        fullOptionGroups: fullOptionGroups,     // ✅ 수정창용 (전체 목록) 저장
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
        item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    })),

  updateCartOptions: (cartId, options) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              options: { ...(item.options ?? {}), ...options },
            }
          : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  getTotalPrice: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      // ✅ 여기는 여전히 selectedBackendOptions를 써야 가격이 계산됩니다!
      const optionsPrice = item.selectedBackendOptions.reduce(
        (optTotal, opt) => optTotal + opt.price * opt.quantity, 0
      );
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  },
}));