import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuOptions } from '../api/MenuApi';
import type { MenuItem, CartItem } from '../types/OrderTypes';

interface BackendOptionItem {
  optionItemId: number;
  name: string;
  optionPrice: number;
}
interface BackendOptionGroup {
  optionGroupId: number;
  name: string;
  isRequired: boolean;
  selectionType: 'SINGLE' | 'MULTI';
  options: BackendOptionItem[];
}

interface Props {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, options: any, quantity: number, backendOptions: any[]) => void;
}

export default function BeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<number, Record<number, number>>>({});

  // 1. API 데이터 호출 (현재 브랜치 로직)
  const { data: rawOptionGroups = [] } = useQuery({
    queryKey: ['options', item?.id],
    queryFn: () => fetchMenuOptions(item!.id),
    enabled: !!item && open,
  });

  const optionGroups = rawOptionGroups as unknown as BackendOptionGroup[];
  // ✅ 현재 선택된 온도(HOT/ICE) 이름을 selections에서 찾아서 ICE인지 판별
  const selectedTempName = useMemo(() => {
    // 온도 그룹 찾기 (이름은 상황에 따라 다를 수 있어서 범용으로)
    const tempGroup = optionGroups.find((g) => {
      const n = g.name.toLowerCase();
      return (
        n.includes('온도') || n.includes('temperature') || n.includes('hot') || n.includes('ice')
      );
    });
    if (!tempGroup) return null;

    const sel = selections[tempGroup.optionGroupId] || {};
    const selectedOptionItemId = Number(Object.keys(sel)[0]); // SINGLE 가정
    const opt = tempGroup.options.find((o) => o.optionItemId === selectedOptionItemId);
    return opt?.name ?? null;
  }, [optionGroups, selections]);

  const isIceSelected = useMemo(() => {
    if (!selectedTempName) return false;
    const n = selectedTempName.toLowerCase();
    return n.includes('ice') || n.includes('얼음') || n.includes('차갑');
  }, [selectedTempName]);

  // 2. 초기값 및 수정 모드 설정
  useEffect(() => {
    if (open && optionGroups.length > 0) {
      const cartItem = item as CartItem;
      const hasSavedOptions =
        cartItem.selectedBackendOptions && cartItem.selectedBackendOptions.length > 0;

      if (hasSavedOptions) {
        // 수정 모드: 저장된 옵션 불러오기
        setQuantity(cartItem.quantity || 1);
        const loadedSelections: Record<number, Record<number, number>> = {};

        optionGroups.forEach((group) => {
          group.options.forEach((opt) => {
            const savedOpt = cartItem.selectedBackendOptions.find(
              (s) => s.optionItemId === opt.optionItemId
            );
            if (savedOpt) {
              if (!loadedSelections[group.optionGroupId])
                loadedSelections[group.optionGroupId] = {};
              loadedSelections[group.optionGroupId][opt.optionItemId] = savedOpt.quantity;
            }
          });
        });
        setSelections(loadedSelections);
} else {
        // 신규 모드: 기본값 자동 선택
        setQuantity(1);
        const initSel: Record<number, Record<number, number>> = {};
        
        optionGroups.forEach((g) => {
          const groupNameLower = g.name.toLowerCase();
          
          // 1. 필수 옵션 (온도, 사이즈 등): 첫 번째 자동 선택
          if (g.isRequired && g.options.length > 0) {
            initSel[g.optionGroupId] = { [g.options[0].optionItemId]: 1 };
          }
          // 2. 휘핑크림: "없음" 기본 선택 (필수 아니어도 선택)
          else if (groupNameLower.includes('휘핑') || groupNameLower.includes('whip')) {
            const noWhipOption = g.options.find(opt => 
              opt.name.includes('없음') || opt.name.toLowerCase().includes('no')
            );
            const defaultOption = noWhipOption || g.options[0];
            if (defaultOption) {
              initSel[g.optionGroupId] = { [defaultOption.optionItemId]: 1 };
            }
          }
        });
        
        setSelections(initSel);
      }
    }
  }, [open, optionGroups, item]);

  // 3. 가격 계산
  const extraPrice = useMemo(() => {
    let total = 0;
    optionGroups.forEach((g) => {
      const sel = selections[g.optionGroupId] || {};
      Object.entries(sel).forEach(([id, qty]) => {
        const opt = g.options.find((o) => o.optionItemId === Number(id));
        if (opt) total += opt.optionPrice * qty;
      });
    });
    return total;
  }, [optionGroups, selections]);

  const finalPrice = ((item?.price || 0) + extraPrice) * quantity;

  // 4. 핸들러들
  const handleOptionClick = (g: BackendOptionGroup, o: BackendOptionItem) => {
    setSelections((prev) => {
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

  const handleOptionDecrement = (g: BackendOptionGroup, o: BackendOptionItem) => {
    setSelections((prev) => {
      const next = { ...prev };
      const gSel = next[g.optionGroupId] || {};
      const qty = gSel[o.optionItemId] || 0;

      if (qty > 0) {
        if (qty === 1) {
          const nextGroupSel = { ...gSel };
          delete nextGroupSel[o.optionItemId];
          next[g.optionGroupId] = nextGroupSel;
        } else {
          next[g.optionGroupId] = { ...gSel, [o.optionItemId]: qty - 1 };
        }
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!item) return;
    const backendOptionsList: any[] = [];
    optionGroups.forEach((g) => {
      const gSel = selections[g.optionGroupId] || {};
      Object.entries(gSel).forEach(([id, qty]) => {
        const opt = g.options.find((o) => o.optionItemId === Number(id));
        if (opt && qty > 0) {
          backendOptionsList.push({
            optionItemId: opt.optionItemId,
            quantity: qty,
            price: opt.optionPrice,
            name: opt.name,
          });
        }
      });
    });
    onAdd(item, {}, quantity, backendOptionsList);
    onClose();
  };

  // ✅ (수정1) 아이콘: HOT/ICE만 나오게
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('hot') || n.includes('따뜻')) return '🔥';
    if (n.includes('ice') || n.includes('얼음')) return '❄️';
    return '';
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
          className="fixed inset-y-[20%] inset-x-[10%] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-grow flex overflow-hidden">
            {/* [Dev 디자인] 왼쪽: 이미지 및 수량 */}
            <div className="w-2/5 p-6 flex flex-col items-center justify-center border-r bg-gray-50">
              <div className="w-48 h-48 bg-gray-100 rounded-full mb-6 p-1 shadow-md overflow-hidden">
                <img
                  src={item.img || '/images/no-image.png'}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="font-bold text-3xl mb-2 text-center leading-tight">{item.name}</h3>
              <p className="text-red-600 font-bold text-4xl mb-6">
                {finalPrice.toLocaleString()}원
              </p>

              <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-3xl font-light hover:text-red-500 w-8"
                >
                  -
                </button>
                <span className="font-bold text-2xl w-10 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-3xl font-light hover:text-red-500 w-8"
                >
                  +
                </button>
              </div>
            </div>

            {/* [Dev 디자인] 오른쪽: 옵션 영역 (스마트 렌더링) */}
            <div className="w-3/5 p-6 overflow-y-auto bg-white">
              {optionGroups.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  {item.category === '디저트' ? '옵션이 없습니다' : '옵션 정보를 불러오는 중...'}
                </div>
              ) : (
                <div className="space-y-4">
                  {optionGroups.map((group) => {
                    const groupNameLower = group.name.toLowerCase();
                    // ✅ ICE가 아닐 때 "얼음양" 그룹 숨김
                    if (
                      (groupNameLower.includes('얼음') || groupNameLower.includes('ice')) &&
                      !isIceSelected
                    ) {
                      return null;
                    }

                    // 1. 샷 추가 (카운터 UI) - Dev 스타일 적용
                    if (groupNameLower.includes('샷') || groupNameLower.includes('shot')) {
                      return (
                        <div key={group.optionGroupId} className="py-4 border-b last:border-0">
                          <div className="flex flex-col gap-3 px-8">
                            {group.options.map((opt) => {
                              const qty = selections[group.optionGroupId]?.[opt.optionItemId] || 0;
                              return (
                                <div
                                  key={opt.optionItemId}
                                  className="flex items-center justify-center gap-6"
                                >
                                  <span className="text-lg font-bold text-gray-700">
                                    {opt.name}
                                  </span>

                                  <div className="flex items-center gap-5 bg-white rounded-full px-5 py-3 border border-gray-200 shadow-sm">
                                    <button
                                      onClick={() => handleOptionDecrement(group, opt)}
                                      className="text-2xl hover:text-red-500 transition-colors"
                                    >
                                      {' '}
                                      -{' '}
                                    </button>

                                    <span className="font-bold text-2xl w-8 text-center">
                                      {qty}
                                    </span>
                                    <button
                                      onClick={() => handleOptionClick(group, opt)}
                                      className="text-2xl hover:text-red-500 transition-colors"
                                    >
                                      {' '}
                                      +{' '}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <h4
                            className="text-gray-700 text-10 mb-3 mt-2
                            text-center"
                          >
                            {group.name} (+500원)
                          </h4>
                        </div>
                      );
                    }

                    //  (수정2) 일반 옵션 (버튼형 UI) - 가운데정렬 + 2줄 라벨
                    return (
                      <div key={group.optionGroupId} className="py-4 border-b last:border-0">
                        <h4 className="font-bold text-xl mb-3 text-center">{group.name}</h4>
                        <div className="flex gap-2 flex-wrap justify-center">
                          {group.options.map((opt) => {
                            const qty = selections[group.optionGroupId]?.[opt.optionItemId] || 0;
                            const isSelected = qty > 0;

                            const prettyLabel = (() => {
                              // 1) 휘핑크림: 공백이 있든 없든 무조건 "휘핑크림\n추가/없음"으로
                              if (opt.name.includes('휘핑크림')) {
                                const suffix = opt.name.replace('휘핑크림', '').trim(); // "추가" or "없음" or "있음"
                                return `휘핑크림\n${suffix || ''}`.trim();
                              }

                              // 2) 괄호가 있으면 "(" 앞에서 줄바꿈: "톨(Tall)" -> "톨\n(Tall)"
                              if (opt.name.includes('(')) {
                                return opt.name.replace('(', '\n(');
                              }

                              // 3) 그 외는 그대로
                              return opt.name;
                            })();

                            return (
                              <button
                                key={opt.optionItemId}
                                onClick={() => handleOptionClick(group, opt)}
                                className={`flex-1 min-w-[30%] h-[110px]
                                  flex flex-col items-center justify-center text-center
                                  p-3 rounded-lg border-2 transition-all ${
                                    isSelected
                                      ? 'border-red-500 bg-red-50 text-black'
                                      : 'border-gray-200 bg-white text-gray-600'
                                  }`}
                              >
                                <span className="text-3xl mb-1">{getIcon(opt.name)}</span>

                                <span className="text-lg font-semibold whitespace-pre-line leading-tight">
                                  {prettyLabel}
                                </span>

                                {opt.optionPrice > 0 && (
                                  <span className="text-xs mt-1 text-red-500">
                                    +{opt.optionPrice}원
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* [Dev 디자인] 하단 버튼 */}
          <div className="grid grid-cols-2 gap-3 p-4 border-t bg-white">
            <button
              onClick={onClose}
              className="w-full bg-white text-gray-500 border-2 border-gray-300 hover:bg-gray-50 py-4 font-bold text-xl transition-colors rounded-xl"
            >
              취소
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 font-bold text-xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center leading-none gap-1 rounded-xl"
            >
              <span>{(item as CartItem).cartId ? '수정 완료' : '주문 담기'}</span>
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
