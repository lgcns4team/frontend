import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuOptions } from '../api/MenuApi';
import type { MenuItem } from '../types/OrderTypes';

// 백엔드 데이터 타입 정의
interface BackendOptionItem { optionItemId: number; name: string; optionPrice: number; }
interface BackendOptionGroup { optionGroupId: number; name: string; isRequired: boolean; selectionType: 'SINGLE' | 'MULTI'; options: BackendOptionItem[]; }

interface Props {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, options: any, quantity: number, backendOptions: any[]) => void;
}

export default function BeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<number, Record<number, number>>>({});

  const { data: rawOptionGroups = [] } = useQuery({
    queryKey: ['options', item?.id],
    queryFn: () => fetchMenuOptions(item!.id),
    enabled: !!item && open,
  });

  // 타입 단언
  const optionGroups = rawOptionGroups as unknown as BackendOptionGroup[];

  // 초기값 설정
  useEffect(() => {
    if (open && optionGroups.length > 0) {
      setQuantity(1);
      const initSel: Record<number, Record<number, number>> = {};
      optionGroups.forEach(g => {
        if (g.isRequired && g.options.length > 0) {
          initSel[g.optionGroupId] = { [g.options[0].optionItemId]: 1 };
        }
      });
      setSelections(initSel);
    }
  }, [open, optionGroups]);

  // 가격 계산
  const extraPrice = useMemo(() => {
    let total = 0;
    optionGroups.forEach(g => {
      const sel = selections[g.optionGroupId] || {};
      Object.entries(sel).forEach(([id, qty]) => {
        const opt = g.options.find(o => o.optionItemId === Number(id));
        if (opt) total += opt.optionPrice * qty;
      });
    });
    return total;
  }, [optionGroups, selections]);

  const finalPrice = ((item?.price || 0) + extraPrice) * quantity;

  // 클릭 핸들러
  const handleOptionClick = (g: BackendOptionGroup, o: BackendOptionItem) => {
    setSelections(prev => {
      const next = { ...prev };
      const gSel = next[g.optionGroupId] || {};
      
      if (g.selectionType === 'SINGLE') {
        next[g.optionGroupId] = { [o.optionItemId]: 1 };
      } else {
        const qty = gSel[o.optionItemId] || 0;
        if (qty < 10) next[g.optionGroupId] = { ...gSel, [o.optionItemId]: qty + 1 };
      }
      return next;
    });
  };

  // 담기 버튼 (정확한 ID 전송)
  const handleAddToCart = () => {
    if (!item) return;
    const backendOptionsList: any[] = [];
    optionGroups.forEach(g => {
      const gSel = selections[g.optionGroupId] || {};
      Object.entries(gSel).forEach(([id, qty]) => {
        const opt = g.options.find(o => o.optionItemId === Number(id));
        if (opt && qty > 0) {
          backendOptionsList.push({
            optionItemId: opt.optionItemId,
            quantity: qty,
            price: opt.optionPrice,
            name: opt.name
          });
        }
      });
    });
    onAdd(item, {}, quantity, backendOptionsList);
    onClose();
  };

  // 디자인 복구용 아이콘
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('hot')) return '🔥';
    if (n.includes('ice')) return '❄️';
    if (n.includes('tall') || n.includes('regular')) return '🥤';
    if (n.includes('large') || n.includes('grande')) return '🥤+';
    if (n.includes('shot')) return '☕';
    if (n.includes('whip')) return '🍦';
    return '✔️';
  };

  if (!open || !item) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
        {/* 사용자님이 원하시던 기존 스타일 (inset-y-[20%]) 복구 */}
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="fixed inset-y-[20%] inset-x-[10%] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex-grow flex overflow-hidden">
            {/* 왼쪽: 이미지 영역 */}
            <div className="w-2/5 p-6 flex flex-col items-center justify-center border-r bg-gray-50">
              <div className="w-48 h-48 bg-white rounded-full mb-6 p-1 shadow-md">
                <img src={item.img || "/images/no-image.png"} className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className="font-bold text-3xl mb-2">{item.name}</h3>
              <p className="text-red-600 font-bold text-4xl mb-6">{finalPrice.toLocaleString()}원</p>
              <div className="flex gap-6 bg-white rounded-full px-6 py-3 border shadow-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-3xl hover:text-red-500 w-8">-</button>
                <span className="font-bold text-2xl w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)} className="text-3xl hover:text-red-500 w-8">+</button>
              </div>
            </div>
            {/* 오른쪽: 옵션 영역 */}
            <div className="w-3/5 p-6 overflow-y-auto bg-white">
              {optionGroups.map(g => (
                <div key={g.optionGroupId} className="pb-6 border-b last:border-0">
                  <h4 className="font-bold text-xl mb-3">{g.name}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {g.options.map(o => {
                      const selected = selections[g.optionGroupId]?.[o.optionItemId] > 0;
                      return (
                        <button key={o.optionItemId} onClick={() => handleOptionClick(g, o)}
                          className={`flex-1 min-w-[30%] flex flex-col items-center p-3 rounded-lg border-2 ${selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600'}`}>
                          <span className="text-3xl mb-1">{getIcon(o.name)}</span>
                          <span className="text-lg font-bold">{o.name}</span>
                          {o.optionPrice > 0 && <span className="text-xs mt-1">+{o.optionPrice}원</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 border-t">
            <button onClick={onClose} className="py-4 border-2 rounded-xl text-xl font-bold text-gray-500">취소</button>
            <button onClick={handleAddToCart} className="py-4 bg-gray-900 text-white rounded-xl text-xl font-bold">주문 담기</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
