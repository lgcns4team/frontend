import { create } from "zustand";
import type { CartItem, MenuItem, Options } from "../types/OrderTypes";

interface CartState {
  cart: CartItem[];
  addToCart: (item: MenuItem, options?: Partial<Options>, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  getCartTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (item, options, quantity = 1) => {
    const cartId = `${item.id}_${options ? JSON.stringify(options) : "basic"}`;

    set((state) => {
      const existing = state.cart.find((i) => i.cartId === cartId);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.cartId === cartId 
              ? { ...i, quantity: i.quantity + quantity } 
              : i
          ),
        };
      }
      return {
        cart: [...state.cart, { ...item, cartId, quantity: quantity, options }],
      };
    });
  },

  removeFromCart: (cartId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.cartId !== cartId),
    })),

  updateQuantity: (cartId, delta) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  getCartTotalPrice: () =>
    get().cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));