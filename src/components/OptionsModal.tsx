import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useQuery } from '@tanstack/react-query'; // API 사용 (백엔드 준비 시 활성화)
// import { fetchMenuOptions } from '../api/MenuApi'; // API 사용 (백엔드 준비 시 활성화)
import type { MenuItem, Options } from '../types/OrderTypes';

type Props = {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, options: Options, quantity: number) => void;
};

export default function BeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  const [quantity, setQuantity] = useState(1);

  // 기본 옵션값 설정
  const [options, setOptions] = useState<Options>({
    temperature: 'cold',
    whip: false,
    shot: 0,
    size: 'grande',
    ice: 'normal',
    isWeak: false,
  });

  // [핵심] API로 옵션 정보 가져오기 (백엔드 준비 시 활성화)
  // item이 있을 때만 쿼리가 실행됩니다 (enabled: !!item)
  // const { data: optionGroups } = useQuery({
  //   queryKey: ['options', item?.id],
  //   queryFn: () => fetchMenuOptions(item!.id),
  //   enabled: !!item && open, // 모달이 열려있고 아이템이 있을 때만 호출
  // });

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setQuantity(1);
      // 옵션 초기화 로직 유지
      setOptions({
        temperature: 'cold',
        whip: false,
        shot: 0,
        size: 'grande',
        ice: 'normal',
        isWeak: false,
      });
    }
  }, [open]);

  // [헬퍼 함수] 특정 옵션 그룹이 서버 응답에 있는지 확인
  // 예: hasOption('샷') -> true면 샷 추가 화면 표시
  const isCoffee = item?.category === '커피' || item?.category?.includes('Coffee');
  const isTea = item?.category === '티' || item?.category?.includes('Tea');

  // 가격 계산 (기본 가격 + 옵션 가격)
  const unitPrice = useMemo(() => {
    if (!item) return 0;
    let price = item.price;
    if (options.size === 'tall') price -= 500;
    if (options.size === 'venti') price += 500;
    if (options.shot > 0) price += options.shot * 500;
    return price;
  }, [item, options]);

  const finalPrice = unitPrice * quantity;

  // 핸들러 함수들
  const handleShotChange = (delta: number) => {
    setOptions((prev) => {
      const newShotCount = Math.max(0, prev.shot + delta);
      const newIsWeak = delta > 0 && newShotCount > 0 ? false : prev.isWeak;
      return { ...prev, shot: newShotCount, isWeak: newIsWeak };
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
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
          className="w-[44rem] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-grow flex overflow-hidden">
            {/* [왼쪽] 이미지 및 수량 */}
            <div className="w-2/5 p-6 flex flex-col items-center justify-center border-r">
              <div className="w-48 h-48 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    draggable={false}
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

            {/* [오른쪽] 옵션 선택 (원래 디자인 복구) */}
            <div className="w-3/5 p-6 overflow-y-auto">
              {/* 디저트는 옵션 없음 */}
              {item.category === '디저트' ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p className="text-lg">옵션이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 1. 온도 */}
                  <div className="py-4 border-b">
                    <h4 className="font-bold text-xl mb-3">1. 온도(hot or ice)</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOptions((s) => ({ ...s, temperature: 'hot' }))}
                        className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${
                          options.temperature === 'hot'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-3xl">🔥</span>
                        <span className="text-lg font-semibold">핫</span>
                      </button>
                      <button
                        onClick={() => setOptions((s) => ({ ...s, temperature: 'cold' }))}
                        className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${
                          options.temperature === 'cold'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-3xl">❄️</span>
                        <span className="text-lg font-semibold">아이스</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. 사이즈 */}
                  <div className="py-4 border-b">
                    <h4 className="font-bold text-xl mb-3">2. 사이즈</h4>
                    <div className="flex gap-2">
                      {['tall', 'grande', 'venti'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setOptions((s) => ({ ...s, size: size as any }))}
                          className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${
                            options.size === size
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-3xl">🥤</span>
                          <span className="capitalize text-lg font-semibold">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. 얼음 양 (아이스일 때만) */}
                  {options.temperature === 'cold' && (
                    <div className="py-4 border-b">
                      <h4 className="font-bold text-xl mb-3">3. 얼음 양</h4>
                      <div className="flex gap-2">
                        {['less', 'normal', 'more'].map((ice) => (
                          <button
                            key={ice}
                            onClick={() => setOptions((s) => ({ ...s, ice: ice as any }))}
                            className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${
                              options.ice === ice
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <span className="text-3xl">🧊</span>
                            <span className="capitalize text-lg font-semibold">
                              {ice === 'less' ? '적게' : ice === 'normal' ? '보통' : '많게'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. 커피 옵션 (샷/연하게) */}
                  {isCoffee && !isTea && (
                    <div className="py-4 border-b">
                      <h4 className="font-bold text-xl mb-3">4. 샷 추가 (+500원)</h4>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() =>
                            setOptions((s) => ({
                              ...s,
                              isWeak: !s.isWeak,
                              shot: !s.isWeak ? 0 : s.shot, // '연하게'를 켜면 샷을 0으로 초기화
                            }))
                          }
                          className={`flex flex-col items-center px-6 py-2 rounded-lg border-2 ${
                            options.isWeak ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-3xl">💧</span>
                          <span className="text-lg font-semibold">연하게</span>
                        </button>
                        <div className="flex items-center gap-5 bg-white rounded-full px-5 py-3 border border-gray-200 shadow-sm">
                          <button
                            onClick={() => handleShotChange(-1)}
                            className="text-2xl hover:text-red-500 transition-colors"
                          >
                            -
                          </button>
                          <span className="font-bold text-2xl w-8 text-center">{options.shot}</span>
                          <button
                            onClick={() => handleShotChange(1)}
                            className="text-2xl hover:text-red-500 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. 휘핑 옵션 */}
                  {!isTea && (
                    <div className="py-4">
                      <h4 className="font-bold text-xl mb-3">{isCoffee ? '5.' : '4.'} 휘핑</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOptions((s) => ({ ...s, whip: true }))}
                          className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${
                            options.whip ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-3xl">🍦</span>
                          <span className="text-lg font-semibold">추가</span>
                        </button>
                        <button
                          onClick={() => setOptions((s) => ({ ...s, whip: false }))}
                          className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${
                            !options.whip ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-3xl">🚫</span>
                          <span className="text-lg font-semibold">없음</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* [하단 버튼] */}
          <div className="grid grid-cols-2 gap-3 p-4 border-t bg-white rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full bg-white text-gray-500 border-2 border-gray-300 hover:bg-gray-50 rounded-xl py-4 font-bold text-xl transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => onAdd({ ...item, price: unitPrice }, options, quantity)}
              className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-4 font-bold text-xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center leading-none gap-1"
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
