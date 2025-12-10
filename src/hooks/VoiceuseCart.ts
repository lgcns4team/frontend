import { useState } from 'react';
import { CartItemData, OrderAction } from '../types/VoiceOrderTypes';
import { generateId } from '../utils/voicehelpers';

export const useCart = () => {

  // 이변수(cart)는 바뀌면 화면을 다시 그려야한다고 알려주는 함수 CartItemData[] 는 배열안에 CartItemData 타입이 들어간다는 뜻 처음엔 빈배열 
  const [cart, setCart] = useState<CartItemData[]>([]);


  const updateCart = (actions: OrderAction[]) => {
    if (!actions || !Array.isArray(actions)) return;

    setCart((prevCart) => {
      // 깊은 복사
      /*
      리액트는 원본이 바뀌는것을 검사할때, 내용물을 하나하나 까보지않고 겉봉투 (메모리주소)만 봅니다
      원본 배열 (prevCart) 을 직접 수정하면, 겉봉투가 바뀌지 않아서 리액트가 변화를 감지하지 못합니다

      그래서 새로운 배열(newCart)을 만들고, 그안에 이전 배열의 아이템들을 복사해서 넣어줍니다
      이렇게 하면 새로운 배열이 만들어지면서 겉봉투가 바뀌기 때문에 리액트가 변화를 감지할 수 있습니다
      */ 
      const newCart = prevCart.map(item => ({ ...item }));

      actions.forEach(action => {
        if (action.type === "ADD" && action.data) {
          const newItem = action.data;
          
          // 1. 옵션으로 키 만들기
          const getOptionKey = (opts?: string[]) => (opts || []).sort().join(',');

          // 2. 같은게 있는지 찾기
          const existingIndex = newCart.findIndex(item => {
            return item.id === newItem.id && 
                   getOptionKey(item.options) === getOptionKey(newItem.options);
          });

          // 3. 있으면 수량+가격 업데이트, 없으면 새로 추가
          if (existingIndex !== -1) {
            newCart[existingIndex].quantity += newItem.quantity;
            newCart[existingIndex].totalPrice = newCart[existingIndex].unitPrice * newCart[existingIndex].quantity;
          } else {
            const unitPrice = newItem.price / newItem.quantity; 
            newCart.push({
              ...newItem,
              _uid: generateId(),
              unitPrice: unitPrice,
              totalPrice: newItem.price
            });
          }
        } 
        // 뒤에서 부터 검색해서 제거할 아이템 찾기
        else if (action.type === "REMOVE") {
          const targetId = action.id;
          const qtyToRemove = action.data?.quantity || 1;

          let targetIndex = -1;
          for (let i = newCart.length - 1; i >= 0; i--) {
            if (newCart[i].id === targetId) {
              targetIndex = i;
              break;
            }
          }

          if (targetIndex !== -1) {
            const item = newCart[targetIndex];
            if (item.quantity > qtyToRemove) {
              item.quantity -= qtyToRemove;
              item.totalPrice = item.unitPrice * item.quantity;
            } else {
              newCart.splice(targetIndex, 1);
            }
          }
        }
        // 장바구니 비우기
        else if (action.type === "CLEAR") {
          newCart.length = 0; // 배열 비우기
        }
      });
      return newCart;
    });
  };

  const clearCart = () => setCart([]);
  
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return { cart, updateCart, clearCart, totalAmount };
};