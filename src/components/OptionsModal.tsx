import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuOptions } from '../api/MenuApi';
import type { MenuItem } from '../types/OrderTypes';
// [변경] 새로 만든 타입 import
import type { BackendOptionGroup, BackendOptionItem } from '../types/OptionTypes';

interface Props {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (
    item: MenuItem, 
    options: any, // 호환성용 (무시)
    quantity: number,
    backendOptions: { optionItemId: number; quantity: number; price: number; name: string }[]
  ) => void;
}

export default function BeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  const [quantity, setQuantity] = useState(1);
  
  // 상태 관리: { 그룹ID: { 옵션ID: 수량 } }
  const [selections, setSelections] = useState<Record<number, Record<number, number>>>({});

  // API 호출
  const { data: optionGroups = [] } = useQuery({
    queryKey: ['options', item?.id],
    queryFn: () => fetchMenuOptions(item!.id),
    enabled: !!item && open,
  });

  // 초기값 설정
  useEffect(() => {
    if (open && optionGroups.length > 0) {
      setQuantity(1);
      const initialSelections: Record<number, Record<number, number>> = {};
      
      optionGroups.forEach(group => {
        // 필수(isRequired)이고 옵션이 있으면 첫 번째 자동 선택
        if (group.isRequired && group.options.length > 0) {
          const firstOpt = group.options[0];
          initialSelections[group.optionGroupId] = { [firstOpt.optionItemId]: 1 };
        }
      });
      setSelections(initialSelections);
    }
  }, [open, optionGroups]);

  // 가격 계산
  const extraPrice = useMemo(() => {
    let total = 0;
    optionGroups.forEach(group => {
      const groupSelections = selections[group.optionGroupId] || {};
      Object.entries(groupSelections).forEach(([optId, qty]) => {
        const option = group.options.find(o => o.optionItemId === Number(optId));
        if (option && qty > 0) {
          total += option.optionPrice * qty;
        }
      });
    });
    return total;
  }, [optionGroups, selections]);

  const finalPrice = ((item?.price || 0) + extraPrice) * quantity;

  // 옵션 클릭 핸들러
  const handleOptionClick = (group: BackendOptionGroup, option: BackendOptionItem) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      const groupSelections = newSelections[group.optionGroupId] || {};

      // A. 단일 선택 (SINGLE) -> 라디오 버튼
      if (group.selectionType === 'SINGLE') {
        newSelections[group.optionGroupId] = { [option.optionItemId]: 1 };
      } 
      // B. 다중 선택 (MULTI) -> 카운터
      else {
        const currentQty = groupSelections[option.optionItemId] || 0;
        if (currentQty < 10) {
          newSelections[group.optionGroupId] = { ...groupSelections, [option.optionItemId]: currentQty + 1 };
        }
      }
      return newSelections;
    });
  };

  // 빼기 버튼 핸들러
  const handleDecrement = (e: React.MouseEvent, group: BackendOptionGroup, option: BackendOptionItem) => {
    e.stopPropagation();
    setSelections(prev => {
      const newSelections = { ...prev };
      const groupSelections = newSelections[group.optionGroupId] || {};
      const currentQty = groupSelections[option.optionItemId] || 0;

      if (currentQty > 0) {
        if (currentQty === 1) {
          const nextGroupSel = { ...groupSelections };
          delete nextGroupSel[option.optionItemId];
          newSelections[group.optionGroupId] = nextGroupSel;
        } else {
          newSelections[group.optionGroupId] = { ...groupSelections, [option.optionItemId]: currentQty - 1 };
        }
      }
      return newSelections;
    });
  };

  const handleAddToCart = () => {
    if (!item) return;

    const backendOptionsList: { optionItemId: number; quantity: number; price: number; name: string }[] = [];
    
    optionGroups.forEach(group => {
      const groupSelections = selections[group.optionGroupId] || {};
      
      // 필수값 안전장치
      if (group.isRequired && Object.keys(groupSelections).length === 0 && group.options.length > 0) {
        const firstOpt = group.options[0];
        backendOptionsList.push({
          optionItemId: firstOpt.optionItemId,
          quantity: 1,
          price: firstOpt.optionPrice,
          name: firstOpt.name
        });
      } else {
        Object.entries(groupSelections).forEach(([optId, qty]) => {
          const option = group.options.find(o => o.optionItemId === Number(optId));
          if (option && qty > 0) {
            backendOptionsList.push({
              optionItemId: option.optionItemId,
              quantity: qty,
              price: option.optionPrice,
              name: option.name
            });
          }
        });
      }
    });

    onAdd(item, {}, quantity, backendOptionsList);
    onClose();
  };

  // 아이콘 헬퍼
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('hot') || n.includes('따뜻')) return '🔥';
    if (n.includes('ice') || n.includes('얼음')) return '❄️';
    if (n.includes('regular') || n.includes('레귤러')) return '🥤';
    if (n.includes('large') || n.includes('라지')) return '🥤+';
    if (n.includes('shot') || n.includes('샷')) return '☕';
    if (n.includes('whip') || n.includes('휘핑')) return '🍦';
    return '✔️';
  };

  if (!open || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed inset-y-[20%] inset-x-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-grow flex overflow-hidden">
            {/* 왼쪽: 이미지 */}
            <div className="w-2/5 p-6 flex flex-col items-center justify-center border-r bg-gray-50">
              <div className="w-48 h-48 bg-white rounded-full mb-6 p-1 shadow-md">
                <img src={item.img || "/images/no-image.png"} alt={item.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className="font-bold text-3xl text-center mb-2">{item.name}</h3>
              <p className="text-red-600 font-bold text-4xl mb-6">{finalPrice.toLocaleString()}원</p>
              
              <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border shadow-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-3xl w-8 hover:text-red-500">-</button>
                <span className="font-bold text-2xl w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="text-3xl w-8 hover:text-red-500">+</button>
              </div>
            </div>

            {/* 오른쪽: 옵션 (백엔드 데이터 기반) */}
            <div className="w-3/5 p-6 overflow-y-auto bg-white">
              {optionGroups.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">옵션 정보를 불러오는 중...</div>
              ) : (
                <div className="space-y-6">
                  {optionGroups.map((group) => (
                    <div key={group.optionGroupId} className="pb-6 border-b last:border-0">
                      <h4 className="font-bold text-xl mb-3 text-gray-800 flex items-center gap-2">
                        {group.name}
                        {group.selectionType === 'MULTI' && <span className="text-sm font-normal text-gray-400">(다중 선택)</span>}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {group.options.map((opt) => {
                          const qty = selections[group.optionGroupId]?.[opt.optionItemId] || 0;
                          const isSelected = qty > 0;
                          
                          return (
                            <button
                              key={opt.optionItemId}
                              onClick={() => handleOptionClick(group, opt)}
                              className={`flex-1 min-w-[30%] flex flex-col items-center p-3 rounded-lg border-2 relative transition-all ${
                                isSelected 
                                  ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-3xl mb-1">{getIcon(opt.name)}</span>
                              <span className="text-lg font-bold">{opt.name}</span>
                              {opt.optionPrice !== 0 && (
                                <span className={`text-xs mt-1 ${isSelected ? 'text-gray-300' : 'text-red-500'}`}>
                                  {opt.optionPrice > 0 ? '+' : ''}{opt.optionPrice}원
                                </span>
                              )}

                              {/* 다중 선택 시 뱃지 */}
                              {group.selectionType === 'MULTI' && isSelected && (
                                <>
                                  <div className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                                    {qty}
                                  </div>
                                  <div 
                                    className="absolute top-1 left-1 w-6 h-6 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white"
                                    onClick={(e) => handleDecrement(e, group, opt)}
                                  >
                                    -
                                  </div>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 border-t">
            <button onClick={onClose} className="py-4 border-2 rounded-xl text-xl font-bold text-gray-500 hover:bg-gray-50">취소</button>
            <button onClick={handleAddToCart} className="py-4 bg-gray-900 text-white rounded-xl text-xl font-bold hover:bg-black shadow-lg">
              주문 담기 <span className="text-sm font-normal text-gray-300 ml-1">{finalPrice.toLocaleString()}원</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}