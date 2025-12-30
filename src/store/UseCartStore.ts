import { create } from 'zustand';
import type { CartItem, MenuItem, Options } from '../types/OrderTypes';
import type { OrderAction } from '../types/VoiceOrderTypes';

// [1] 옵션 설정 (VoiceuseCart에서 가져옴)
const OPTION_CONFIG: Record<string, { name: string; price: number; group?: string; order: number }> = {
  hot: { name: '따뜻하게', price: 0, group: 'temp', order: 1 },
  cold: { name: '아이스', price: 0, group: 'temp', order: 1 },
  tall: { name: '톨 사이즈', price: -500, group: 'size', order: 2 },
  grande: { name: '그란데 사이즈', price: 0, group: 'size', order: 2 },
  venti: { name: '벤티 사이즈', price: 500, group: 'size', order: 2 },
  less_ice: { name: '얼음 적게', price: 0, group: 'ice', order: 3 },
  normal_ice: { name: '얼음 보통', price: 0, group: 'ice', order: 3 },
  more_ice: { name: '얼음 많이', price: 0, group: 'ice', order: 3 },
  weak: { name: '연하게', price: 0, group: 'strength', order: 4 },
  shot: { name: '샷 추가', price: 500, order: 5 },
  whip: { name: '휘핑 추가', price: 0, group: 'whip', order: 6 },
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
  if (merged.includes('weak')) globalOptions.isWeak = true;

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
  
  // ⭐️ [수정] menuItems를 인자로 받도록 변경
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

  // ⭐️ [수정] dispatchVoiceActions 구현
  dispatchVoiceActions: (actions: OrderAction[], menuItems: MenuItem[]) => {
    if (!actions || !Array.isArray(actions)) return;

    set((state) => {
      const newCart = [...state.cart];

      actions.forEach((action) => {
        // --- ADD ---
        if (action.type === 'ADD') {
          const newItemData = action.data;
          
          // 1. 전체 메뉴에서 이름으로 실제 아이템 찾기 (ID, 이미지 확보용)
          const originalItem = menuItems.find(item => item.name === newItemData.name);

          // 2. 옵션 변환
          const inputOptionIds = newItemData.option_ids || [];
          const { mergedIds, globalOptions } = processOptions([], inputOptionIds);

          // 3. 백엔드 전송용 옵션 구조 생성 (가격 계산용)
          const backendOptions = mergedIds.map(id => {
             const config = OPTION_CONFIG[id];
             return {
               optionItemId: 999, // 임시 ID
               name: config?.name || id,
               price: config?.price || 0,
               quantity: 1
             };
          });

          // 4. ID 처리 (string -> number 변환 또는 랜덤값)
          const finalId = originalItem ? originalItem.id : (parseInt(newItemData.id) || Date.now());
          const finalImg = originalItem ? originalItem.img : '';
          const finalCategory = originalItem ? originalItem.category : '음성주문';

          // 5. 장바구니에 추가
          newCart.push({
             id: finalId, 
             name: newItemData.name,
             price: newItemData.price,
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
           // 'last_item' 처리
           if (action.targetId === 'last_item') {
              targetIndex = newCart.length - 1;
           } else {
              // ID로 역순 검색 (String 변환 후 비교)
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
            // 예시: 마지막 아이템 삭제 혹은 ID 검색 삭제
            // 여기서는 단순하게 'last_item'이거나 못 찾으면 마지막 삭제로 가정할 수 있음
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