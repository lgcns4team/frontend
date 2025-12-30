import { create } from 'zustand';
import type { CartItem, MenuItem, Options } from '../types/OrderTypes';
// OrderAction 타입을 가져오기 위해 임포트 필수
import type { OrderAction } from '../types/VoiceOrderTypes';

// [1] 백엔드 DB(SQL) 기준 옵션 설정 수정
const OPTION_CONFIG: Record<string, { name: string; price: number; group?: string; order: number }> = {
  // 온도 (가격 0원)
  hot: { name: 'HOT', price: 0, group: 'temp', order: 1 },
  cold: { name: 'ICE', price: 0, group: 'temp', order: 1 },

  // 사이즈 (톨 기본 0원, 그란데 +500, 벤티 +1000)
  tall: { name: '톨(Tall)', price: 0, group: 'size', order: 2 },
  grande: { name: '그란데(Grande)', price: 500, group: 'size', order: 2 },
  venti: { name: '벤티(Venti)', price: 1000, group: 'size', order: 2 },

  // 얼음량 (가격 0원, 명칭 '얼음' 제거)
  less_ice: { name: '적게', price: 0, group: 'ice', order: 3 },
  normal_ice: { name: '보통', price: 0, group: 'ice', order: 3 },
  more_ice: { name: '많이', price: 0, group: 'ice', order: 3 },

  // 샷 추가 (+500원)
  shot: { name: '샷 추가', price: 500, order: 5 },

  // 휘핑 크림 (+500원)
  whip: { name: '휘핑 크림 추가', price: 500, group: 'whip', order: 6 },
  
  // '연하게(weak)' 옵션은 DB에 없으므로 삭제함
};

// [2] 옵션 처리 헬퍼 함수
const processOptions = (baseIds: string[], newIds: string[]) => {
  let merged = baseIds.filter((oldId) => {
    return !newIds.some((newId) => {
      if (oldId === newId && oldId !== 'shot') return true;
      const groupOld = OPTION_CONFIG[oldId]?.group;
      const groupNew = OPTION_CONFIG[newId]?.group;
      if (groupOld && groupNew && groupOld === groupNew) return true;
      return false;
    });
  });
  merged = [...merged, ...newIds];
  merged.sort((a, b) => (OPTION_CONFIG[a]?.order || 99) - (OPTION_CONFIG[b]?.order || 99));
  
  const displayNames = merged.map((id) => OPTION_CONFIG[id]?.name || id);

  // 전역 Store용 Options 객체로 변환
  const globalOptions: Partial<Options> = {};
  if (merged.includes('hot')) globalOptions.temperature = 'hot';
  else if (merged.includes('cold')) globalOptions.temperature = 'cold';
  
  if (merged.includes('tall')) globalOptions.size = 'tall';
  else if (merged.includes('venti')) globalOptions.size = 'venti';
  else globalOptions.size = 'grande';

  globalOptions.shot = merged.filter(id => id === 'shot').length;

  if (merged.includes('less_ice')) globalOptions.ice = 'less';
  else if (merged.includes('more_ice')) globalOptions.ice = 'more';
  else globalOptions.ice = 'normal';

  if (merged.includes('whip')) globalOptions.whip = true;
  // weak 관련 로직 삭제

  return { mergedIds: merged, displayNames, globalOptions };
};

// 옵션 비교 헬퍼
const areOptionsEqual = (opts1: any[], opts2: any[]) => {
  if (opts1.length !== opts2.length) return false;
  const sorted1 = [...opts1].sort((a, b) => a.optionItemId - b.optionItemId);
  const sorted2 = [...opts2].sort((a, b) => a.optionItemId - b.optionItemId);
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

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
  
  dispatchVoiceActions: (actions: OrderAction[], menuItems: MenuItem[]) => void;
}

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

  getTotalPrice: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      const optionsPrice = item.selectedBackendOptions.reduce(
        (acc, opt) => acc + (opt.price * opt.quantity), 
        0
      );
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  },

  dispatchVoiceActions: (actions: OrderAction[], menuItems: MenuItem[]) => {
    if (!actions || !Array.isArray(actions)) return;

    set((state) => {
      const newCart = [...state.cart];

      actions.forEach((action) => {
        // --- ADD ---
        if (action.type === 'ADD') {
          const newItemData = action.data;
          
          const originalItem = menuItems.find(item => item.name === newItemData.name);

          const inputOptionIds = newItemData.option_ids || [];
          const { mergedIds, globalOptions } = processOptions([], inputOptionIds);

          const backendOptions = mergedIds.map(id => {
             const config = OPTION_CONFIG[id];
             return {
               optionItemId: 999, // 임시 ID (백엔드 매칭 필요 시 수정 필요)
               name: config?.name || id,
               price: config?.price || 0,
               quantity: 1
             };
          });

          const finalId = originalItem ? originalItem.id : (parseInt(newItemData.id) || Date.now());
          const finalImg = originalItem ? originalItem.img : '';
          const finalCategory = originalItem ? originalItem.category : '음성주문';
          const finalPrice = originalItem ? originalItem.price : newItemData.price; // 원본 가격 우선 사용

          newCart.push({
             id: finalId, 
             name: newItemData.name,
             price: finalPrice,
             category: finalCategory,
             img: finalImg,
             cartId: Math.random().toString(36).substr(2, 9),
             quantity: newItemData.quantity || 1,
             options: globalOptions,
             selectedBackendOptions: backendOptions,
          } as CartItem);
        }
        
        // --- UPDATE ---
        else if (action.type === 'UPDATE') {
           let targetIndex = -1;
           if (action.targetId === 'last_item') {
              targetIndex = newCart.length - 1;
           } else {
              for (let i = newCart.length - 1; i >= 0; i--) {
                 if (String(newCart[i].name) === action.targetId || String(newCart[i].id) === action.targetId) {
                    targetIndex = i;
                    break;
                 }
              }
           }

           if (targetIndex !== -1) {
              const prevItem = newCart[targetIndex];
              const newData = action.data;
              
              const { globalOptions, mergedIds } = processOptions([], newData.option_ids || []);
              
              const newBackendOptions = mergedIds.map(id => {
                 const config = OPTION_CONFIG[id];
                 return {
                   optionItemId: 999,
                   name: config?.name || id,
                   price: config?.price || 0,
                   quantity: 1
                 };
              });

              newCart[targetIndex] = {
                 ...prevItem,
                 options: { ...prevItem.options, ...globalOptions },
                 selectedBackendOptions: [...prevItem.selectedBackendOptions, ...newBackendOptions]
              };
           }
        }
        
        // --- REMOVE ---
        else if (action.type === 'REMOVE') {
            const targetId = action.id;
             if (targetId === 'last_item' && newCart.length > 0) {
                 newCart.pop();
             } else {
                 const idx = newCart.findIndex(item => String(item.id) === targetId || item.name === targetId);
                 if (idx !== -1) newCart.splice(idx, 1);
             }
        }
        
        // --- CLEAR ---
        else if (action.type === 'CLEAR') {
           newCart.length = 0;
        }
      });

      return { cart: newCart };
    });
  }
}));