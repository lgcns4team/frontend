import { useState } from 'react';
import { generateId } from '../utils/voicehelpers';
import type { OrderAction, CartItemData } from '../types/VoiceOrderTypes';


// 1. 옵션 설정 (그룹, 한글명, 가격, **정렬순서**)
// order가 낮을수록 앞에 표시됩니다.
const OPTION_CONFIG: Record<string, { name: string; price: number; group?: string; order: number }> = {
  // [1순위] 온도 (Hot/Ice)
  hot: { name: '따뜻하게', price: 0, group: 'temp', order: 1 },
  cold: { name: '아이스', price: 0, group: 'temp', order: 1 },

  // [2순위] 사이즈 (Tall/Grande/Venti)
  tall: { name: '톨 사이즈', price: -500, group: 'size', order: 2 },
  grande: { name: '그란데 사이즈', price: 0, group: 'size', order: 2 },
  venti: { name: '벤티 사이즈', price: 500, group: 'size', order: 2 },

  // [3순위] 얼음량
  less_ice: { name: '얼음 적게', price: 0, group: 'ice', order: 3 },
  normal_ice: { name: '얼음 보통', price: 0, group: 'ice', order: 3 },
  more_ice: { name: '얼음 많이', price: 0, group: 'ice', order: 3 },

  // [4순위] 농도/샷
  weak: { name: '연하게', price: 0, group: 'strength', order: 4 },
  shot: { name: '샷 추가', price: 500, order: 5 }, // 샷은 중복 가능하므로 그룹 없음

  // [5순위] 휘핑 및 기타
  whip: { name: '휘핑 추가', price: 0, group: 'whip', order: 6 },
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItemData[]>([]);

  // 헬퍼 함수: 옵션 ID 리스트를 받아서 충돌 제거 및 정렬 수행
  const processOptions = (baseIds: string[], newIds: string[]) => {
    // 1. 기존 ID 중, 새 ID와 충돌하는 그룹 제거
    let merged = baseIds.filter(oldId => {
      return !newIds.some(newId => {
        // 완전히 같은 경우 제거 (중복 방지) - 샷 제외
        if (oldId === newId && oldId !== 'shot') return true;
        
        // 같은 그룹(예: hot vs cold)이면 기존 것 제거
        const groupOld = OPTION_CONFIG[oldId]?.group;
        const groupNew = OPTION_CONFIG[newId]?.group;
        if (groupOld && groupNew && groupOld === groupNew) return true;

        return false;
      });
    });

    // 2. 새 ID 합치기
    merged = [...merged, ...newIds];

    // 3. 순서 정렬 (Config의 order 기준)
    merged.sort((a, b) => {
      const orderA = OPTION_CONFIG[a]?.order || 99; // 설정 없으면 맨 뒤로
      const orderB = OPTION_CONFIG[b]?.order || 99;
      return orderA - orderB;
    });

    // 4. 표시용 한글 이름 변환
    const displayNames = merged.map(id => OPTION_CONFIG[id]?.name || id);

    return { mergedIds: merged, displayNames };
  };

  const updateCart = (actions: OrderAction[]) => {
    // ✅ [디버깅 로그 추가] - 함수 호출 확인
    console.log('🔍 updateCart 호출됨:', actions);
    
    if (!actions || !Array.isArray(actions)) {
      // ✅ [디버깅 로그 추가] - actions 검증 실패시
      console.log('❌ actions가 없거나 배열이 아님:', actions);
      return;
    }

    setCart((prevCart) => {
      // ✅ [디버깅 로그 추가] - 현재 카트 상태
      console.log('🔍 현재 카트:', prevCart);
      const newCart = [...prevCart];

      actions.forEach((action) => {
        // ✅ [디버깅 로그 추가] - 처리중인 액션
        console.log('🔍 처리중인 액션:', action);
        
        // [CASE 1] 신규 추가 (ADD)
        if (action.type === 'ADD') {
          const newItem = action.data;
          // ✅ [디버깅 로그 추가] - ADD 액션의 데이터
          console.log('🔍 ADD - newItem:', newItem);
          
          const inputOptionIds = newItem.option_ids || [];

          // 1. 옵션 정렬 및 중복 정리
          // (여기서 나온 mergedIds는 항상 정해진 순서대로 정렬되어 있음)
          const { mergedIds, displayNames } = processOptions([], inputOptionIds);

          // 2. 중복 아이템 찾기 (비교 로직) 🕵️‍♂️
          // 조건: 메뉴 ID가 같고 && 옵션 ID 목록이 문자열로 변환했을 때 똑같아야 함
          // 예: ['cold', 'tall'] === ['cold', 'tall']
          const existingIndex = newCart.findIndex(item => {
            return item.id === newItem.id && 
                   JSON.stringify(item.option_ids) === JSON.stringify(mergedIds);
          });

          // 3. 같은게 있으면 -> 수량만 증가 (합치기)
          if (existingIndex !== -1) {
            const existingItem = newCart[existingIndex];
            
            // 수량 합산
            const updatedQuantity = existingItem.quantity + newItem.quantity;
            
            newCart[existingIndex] = {
              ...existingItem,
              quantity: updatedQuantity,
              // 총액 재계산 (단가 * 새 수량)
              totalPrice: existingItem.unitPrice * updatedQuantity
            };
            
            // ✅ [디버깅 로그 추가] - 기존 아이템 수량 증가
            console.log('🔍 기존 아이템 수량 증가:', newCart[existingIndex]);
          } 
          // 4. 같은게 없으면 -> 새로 추가 (기존 로직)
          else {
            const cartItem = {
              ...newItem,
              _uid: generateId(),
              option_ids: mergedIds,
              options: displayNames,
              unitPrice: newItem.price / newItem.quantity,
              totalPrice: newItem.price,
            };
            
            // ✅ [디버깅 로그 추가] - 장바구니에 추가할 아이템
            console.log('🔍 장바구니에 추가할 아이템:', cartItem);
            newCart.push(cartItem);
          }
        }

        // [CASE 2] 수정/변경 (UPDATE)
        else if (action.type === 'UPDATE') {
          let targetId = action.targetId; // 예: "americano" 또는 "last_item"
          const newData = action.data;

          let foundIndex = -1;

          // ✅ [핵심 수정] "last_item" (아까 담은 거) 요청이 오면 -> 장바구니 맨 마지막 아이템을 타겟으로 잡음
          if (targetId === 'last_item') {
             if (newCart.length > 0) {
                 foundIndex = newCart.length - 1; // 맨 뒤 인덱스
                 targetId = newCart[foundIndex].id; // 실제 ID(예: americano)로 교체
             }
          } else {
             // 기존 로직: ID로 뒤에서부터 검색
             for (let i = newCart.length - 1; i >= 0; i--) {
                if (newCart[i].id === targetId) {
                  foundIndex = i;
                  break;
                }
             }
          }

          if (foundIndex !== -1) {
            const prevItem = newCart[foundIndex];
            
            // 1. 옵션 병합 및 정렬
            const { mergedIds, displayNames } = processOptions(
              prevItem.option_ids || [], 
              newData.option_ids || []
            );

            // 2. 가격 재계산 로직
            const oldOptionsPrice = (prevItem.option_ids || []).reduce((sum, id) => {
                return sum + (OPTION_CONFIG[id]?.price || 0);
            }, 0);

            const baseMenuPrice = (prevItem.totalPrice / prevItem.quantity) - oldOptionsPrice;

            const newOptionsPrice = mergedIds.reduce((sum, id) => {
                return sum + (OPTION_CONFIG[id]?.price || 0);
            }, 0);

            const finalUnitPrice = baseMenuPrice + newOptionsPrice;
            const finalTotalPrice = finalUnitPrice * prevItem.quantity;

            newCart[foundIndex] = {
              ...prevItem,
              // ID가 'last_item'으로 왔을 경우, 기존 아이템의 ID를 유지해야 함
              id: prevItem.id, 
              name: prevItem.name, // 이름도 기존 이름 유지
              option_ids: mergedIds,
              options: displayNames,
              unitPrice: finalUnitPrice,
              totalPrice: finalTotalPrice,
            };
          } else {
             // 타겟을 못 찾았는데 'last_item'이었다면? -> 장바구니가 빈 것이므로 무시하거나 에러 처리
             if (targetId === 'last_item') return;

             // 그 외 일반적인 경우 신규 추가 (기존 로직)
             const inputOptionIds = newData.option_ids || [];
             const { mergedIds, displayNames } = processOptions([], inputOptionIds);

             newCart.push({
               ...newData,
               _uid: generateId(),
               option_ids: mergedIds,
               options: displayNames,
               unitPrice: newData.price / newData.quantity,
               totalPrice: newData.price,
             });
          }
        }


       
        // [CASE 3] 삭제 (REMOVE)
        else if (action.type === 'REMOVE') {
          const targetId = action.id;
          const mode = (action.data as any)?.mode || 'last';

          let targetIndex = -1;

          if (mode === 'first') {
            for (let i = 0; i < newCart.length; i++) {
              if (newCart[i].id === targetId) {
                targetIndex = i;
                break;
              }
            }
          } else { // 'last' 모드
            for (let i = newCart.length - 1; i >= 0; i--) {
              if (newCart[i].id === targetId) {
                targetIndex = i;
                break;
              }
            }
          }

          if (targetIndex !== -1) {
            newCart.splice(targetIndex, 1);
          } 
        }

        // [CASE 4] 초기화 (CLEAR)
        else if (action.type === 'CLEAR') {
          newCart.length = 0;
        }
      });

      // ✅ [디버깅 로그 추가] - 최종 장바구니 상태
      console.log('🔍 최종 newCart:', newCart);
      return newCart;
    });
  };

  // ✅ [추가됨] 수량 변경 함수 (+ / - 버튼 연결용)
  const changeQuantity = (cartId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        // VoiceOrder에서는 item._uid를 키로 사용합니다.
        if (item._uid === cartId) {
          const newQty = Math.max(1, item.quantity + delta); // 최소 1개 유지
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty // 가격도 수량에 맞춰 업데이트
          };
        }
        return item;
      });
    });
  };

  const removeItem = (uid: string) => {
    setCart((prevCart) => prevCart.filter(item => item._uid !== uid));
  };

  const clearCart = () => setCart([]);
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  

  // changeQuantity를 반환 객체에 포함시켜야 VoiceOrder.tsx에서 쓸 수 있습니다.
  return { cart, updateCart, clearCart, totalAmount, changeQuantity, removeItem };
};