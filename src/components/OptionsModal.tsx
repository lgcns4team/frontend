import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuOptions } from '../api/MenuApi';
import type { MenuItem, Options } from '../types/OrderTypes';

interface Props {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  // [로직] 백엔드로 보낼 ID 리스트를 받는 함수
  onAdd: (
    item: MenuItem, 
    options: Partial<Options>, 
    quantity: number,
    backendOptions: { optionItemId: number; quantity: number; price: number; name: string }[]
  ) => void;
}

export default function BeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  // --------------------------------------------------------------------------------
  // [Logic Section] 기능은 최신 API 연동 로직을 사용합니다.
  // --------------------------------------------------------------------------------
  const [quantity, setQuantity] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Record<number, number>>({});

  // 1. API 데이터 불러오기
  const { data: optionGroups = [] } = useQuery({
    queryKey: ['options', item?.id],
    queryFn: () => fetchMenuOptions(item!.id),
    enabled: !!item && open,
  });

  // 2. 모달 열리면 기본값(첫번째 옵션) 자동 선택
  useEffect(() => {
    if (open && optionGroups.length > 0) {
      setQuantity(1);
      const defaults: Record<number, number> = {};
      optionGroups.forEach((group) => {
        if (group.options.length > 0) {
          defaults[group.id] = group.options[0].id;
        }
      });
      setSelectedIds((prev) => ({ ...defaults, ...prev }));
    }
  }, [open, optionGroups]);

  // 3. 가격 계산
  const extraPrice = useMemo(() => {
    return optionGroups.reduce((total, group) => {
      const selectedId = selectedIds[group.id];
      const option = group.options.find(o => o.id === selectedId);
      return total + (option?.price || 0);
    }, 0);
  }, [optionGroups, selectedIds]);

  const finalPrice = ((item?.price || 0) + extraPrice) * quantity;

  // 4. 수량 조절 핸들러 (사용자님 코드 대응)
  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // 5. 담기 버튼 핸들러 (백엔드 전송용 데이터 조립)
  const handleAddToCart = () => {
    if (!item) return;

    // 안전장치: 선택 안 된 옵션은 첫 번째 값 강제 선택
    const currentSelectedIds = { ...selectedIds };
    optionGroups.forEach(g => {
        if (!currentSelectedIds[g.id] && g.options.length > 0) {
            currentSelectedIds[g.id] = g.options[0].id;
        }
    });

    const backendOptionsList: { optionItemId: number; quantity: number; price: number; name: string }[] = [];
    Object.entries(currentSelectedIds).forEach(([groupId, optionId]) => {
      const group = optionGroups.find(g => g.id === Number(groupId));
      const option = group?.options.find(o => o.id === optionId);
      if (option) {
        backendOptionsList.push({
          optionItemId: option.id, 
          quantity: 1, 
          price: option.price,
          name: option.name
        });
      }
    });

    onAdd(item, {}, quantity, backendOptionsList);
    onClose();
  };

  // --------------------------------------------------------------------------------
  // [Design Helpers] 사용자님 디자인(아이콘, 색상)을 유지하기 위한 도구들
  // --------------------------------------------------------------------------------
  const getIcon = (name: string) => {
    if (name.includes('Hot') || name.includes('따뜻')) return '🔥';
    if (name.includes('Ice') || name.includes('아이스') || name.includes('Cold')) return '❄️';
    if (name.includes('Tall')) return '🥤';
    if (name.includes('Grande')) return '🥤+';
    if (name.includes('Venti')) return '🥤++';
    if (name.includes('샷')) return '☕';
    if (name.includes('휘핑')) return '🍦';
    if (name.includes('연하게')) return '💧';
    if (name.includes('적게')) return '🧊';
    return '✔️';
  };

  // 사용자님이 원하시는 '선택 시 색상 변경' 로직
  const getButtonClass = (name: string, isSelected: boolean) => {
    const base = "flex-1 flex flex-col items-center p-3 rounded-lg border-2";
    
    if (!isSelected) {
      return `${base} border-gray-200 bg-white`;
    }

    if (name.includes('Hot') || name.includes('따뜻')) return `${base} border-red-500 bg-red-50 text-red-600`;
    if (name.includes('Ice') || name.includes('아이스') || name.includes('Cold')) return `${base} border-red-500 bg-red-50 text-red-600`; // 사용자 코드에서 Ice도 red 스타일이었음 (원하면 blue로 변경 가능)
    
    // 기본 선택 스타일 (사이즈 등) - 사용자 코드에는 없었지만 필요할 경우 추가
    return `${base} border-red-500 bg-red-50 text-red-600`; 
  };


  if (!open || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          // [디자인 유지] 사용자님이 강조하신 위치와 크기
          className="fixed inset-y-[20%] inset-x-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-grow flex overflow-hidden">
            {/* [왼쪽] 이미지 및 수량 (사용자님 코드 100% 동일) */}
            <div className="w-2/5 p-6 flex flex-col items-center justify-center border-r">
              <div className="w-48 h-48 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300?text=No+Image")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="font-bold text-3xl text-center leading-tight mb-2">{item.name}</h3>
              <p className="text-red-600 font-bold text-4xl mb-6">
                {finalPrice.toLocaleString()}원
              </p>

              {/* 수량 조절 */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="text-3xl font-light hover:text-red-500"
                  >
                    -
                  </button>
                  <span className="font-bold text-2xl w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="text-3xl font-light hover:text-red-500"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* [오른쪽] 옵션 선택 (디자인 구조 유지 + 내용만 API 연동) */}
            <div className="w-3/5 p-6 overflow-y-auto">
              {/* 옵션이 필요 없는 메뉴 (디저트 등) */}
              {optionGroups.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p className="text-lg">옵션 정보를 불러오는 중...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* API에서 받아온 그룹들을 사용자님 디자인(py-4 border-b)에 맞춰 렌더링 */}
                  {optionGroups.map((group) => (
                    <div key={group.id} className="py-4 border-b last:border-0">
                      <h4 className="font-bold text-xl mb-3 text-center">{group.name}</h4>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {group.options.map((opt) => {
                          const isSelected = selectedIds[group.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedIds(prev => ({ ...prev, [group.id]: opt.id }))}
                              // [디자인 적용] 사용자님이 작성하신 조건부 스타일 클래스 적용
                              className={getButtonClass(opt.name, isSelected)}
                            >
                              <span className="text-3xl">{getIcon(opt.name)}</span>
                              <span className="text-lg font-semibold">{opt.name}</span>
                              {opt.price > 0 && (
                                <span className="text-xs font-medium mt-1">+{opt.price}원</span>
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

          {/* [하단 버튼] (사용자님 코드 100% 동일) */}
          <div className="grid grid-cols-2 gap-3 p-4 border-t bg-white">
            <button
              onClick={onClose}
              className="w-full bg-white text-gray-500 border-2 border-gray-300 hover:bg-gray-50 py-4 font-bold text-xl transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 font-bold text-xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center leading-none gap-1"
            >
              <span>주문 담기</span>
              <span className="text-sm font-normal text-gray-300">
                {finalPrice.toLocaleString()}원
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}