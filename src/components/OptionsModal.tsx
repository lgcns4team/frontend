import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuOptions } from '../api/MenuApi';
import type { MenuItem, Options, MenuOptionGroup } from '../types/OrderTypes';

interface Props {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (
    item: MenuItem, 
    options: Partial<Options>, 
    quantity: number,
    backendOptions: { optionItemId: number; quantity: number; price: number; name: string }[]
  ) => void;
}

export default function BeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  // 1. 상태 관리
  const [quantity, setQuantity] = useState(1);
  
  // UI 상태 (화면 표시용)
  const [tempState, setTempState] = useState<'hot' | 'ice' | null>(null);
  const [sizeState, setSizeState] = useState<'tall' | 'grande' | 'venti'>('tall');
  const [iceState, setIceState] = useState<'less' | 'normal' | 'more'>('normal');
  const [shotCount, setShotCount] = useState(0);
  const [isWeak, setIsWeak] = useState(false);
  const [whipState, setWhipState] = useState(false);

  // 2. API 데이터 호출
  const { data: optionGroups = [] } = useQuery({
    queryKey: ['options', item?.id],
    queryFn: () => fetchMenuOptions(item!.id),
    enabled: !!item && open,
  });

  // 3. 헬퍼 함수: 키워드로 그룹 및 옵션 찾기
  const findGroup = (keywords: string[]) => 
    optionGroups.find(g => keywords.some(k => g.name.includes(k)));

  const findOption = (group: MenuOptionGroup | undefined, keywords: string[]) => 
    group?.options.find(o => keywords.some(k => o.name.toLowerCase().includes(k)));

  // 실제 데이터 그룹들 연결
  const tempGroup = findGroup(['온도', 'Temp']);
  const sizeGroup = findGroup(['사이즈', 'Size', '크기']);
  const iceGroup  = findGroup(['얼음', 'Ice']);
  const shotGroup = findGroup(['샷', 'Shot', '에스프레소']);
  const whipGroup = findGroup(['휘핑', 'Whip', '크림']);

  // 4. 초기값 설정
  useEffect(() => {
    if (open && item) {
      setQuantity(1);
      setShotCount(0);
      setIsWeak(false);
      setWhipState(false);
      
      // 기본 온도 설정 (이름에 아이스가 있으면 Ice)
      if (item.name.includes('아이스') || item.name.includes('Ice')) setTempState('ice');
      else setTempState('hot');

      setSizeState('grande'); // 기본 사이즈 (필요시 tall로 변경)
      setIceState('normal');
    }
  }, [open, item]);

  // ----------------------------------------------------------------------
  // [수정 핵심 1] 가격 계산 로직 (API 데이터 + 하드코딩 룰 혼합)
  // ----------------------------------------------------------------------
  const extraPrice = useMemo(() => {
    let total = 0;

    // 1. 사이즈 가격 (하드코딩 룰 적용)
    if (sizeState === 'tall') total -= 500;
    if (sizeState === 'venti') total += 500;

    // 2. 샷 가격 (수량 * 500원)
    if (shotCount > 0) total += (shotCount * 500);

    // 3. 휘핑 가격 (API 가격 참조)
    if (whipState && whipGroup) {
       const whipOpt = findOption(whipGroup, ['휘핑', 'whip']);
       if (whipOpt) total += whipOpt.price;
    }

    return total;
  }, [sizeState, shotCount, whipState, whipGroup]);

  const finalPrice = ((item?.price || 0) + extraPrice) * quantity;

  // ----------------------------------------------------------------------
  // [수정 핵심 2] 담기 버튼 클릭 (장바구니에 정확한 가격 전달)
  // ----------------------------------------------------------------------
  const handleAddToCart = () => {
    if (!item) return;

    const backendOptionsList: { optionItemId: number; quantity: number; price: number; name: string }[] = [];

    // 1) 온도
    if (tempGroup) {
      const keyword = tempState === 'hot' ? ['hot', '따뜻', '핫'] : ['ice', '아이스', '차가운'];
      const opt = findOption(tempGroup, keyword);
      if (opt) backendOptionsList.push({ optionItemId: opt.id, quantity: 1, price: 0, name: opt.name });
    }

    // 2) 사이즈 (가격 반영 필수!)
    if (sizeGroup) {
      const opt = findOption(sizeGroup, [sizeState]);
      if (opt) {
        // [중요] API 가격이 0이어도, 프론트 룰(-500, +500)을 강제로 주입해야 장바구니 계산이 맞음
        let adjustedPrice = opt.price;
        if (sizeState === 'tall') adjustedPrice = -500;
        if (sizeState === 'venti') adjustedPrice = 500;
        
        backendOptionsList.push({ optionItemId: opt.id, quantity: 1, price: adjustedPrice, name: opt.name });
      }
    }

    // 3) 얼음
    if (tempState === 'ice' && iceGroup) {
      const keyword = iceState === 'less' ? ['적게', 'less'] : iceState === 'more' ? ['많이', 'more'] : ['보통', 'normal'];
      const opt = findOption(iceGroup, keyword);
      if (opt) backendOptionsList.push({ optionItemId: opt.id, quantity: 1, price: 0, name: opt.name });
    }

    // 4) 샷 추가
    if (shotCount > 0) {
      let shotOpt = findOption(shotGroup, ['샷', 'shot']);
      // 못 찾으면 전체 검색
      if (!shotOpt) {
         optionGroups.forEach(g => {
            const found = g.options.find(o => o.name.includes('샷') || o.name.includes('Shot'));
            if (found) shotOpt = found;
         });
      }
      
      if (shotOpt) {
        // 샷은 1개당 500원
        backendOptionsList.push({ optionItemId: shotOpt.id, quantity: shotCount, price: 500, name: shotOpt.name });
      }
    }

    // 5) 연하게
    if (isWeak) {
      let weakOpt: any = null;
      optionGroups.forEach(g => {
        const found = g.options.find(o => o.name.includes('연하게') || o.name.includes('Weak'));
        if (found) weakOpt = found;
      });
      if (weakOpt) {
        backendOptionsList.push({ optionItemId: weakOpt.id, quantity: 1, price: weakOpt.price, name: weakOpt.name });
      }
    }

    // 6) 휘핑
    if (whipState) {
       let whipOpt = findOption(whipGroup, ['휘핑', 'whip', '추가']);
       if (whipOpt) {
         backendOptionsList.push({ optionItemId: whipOpt.id, quantity: 1, price: whipOpt.price, name: whipOpt.name });
       }
    }

    // 화면용 데이터
    const displayOptions: Partial<Options> = {
        temperature: tempState === 'hot' ? 'hot' : 'cold',
        size: sizeState,
        ice: iceState,
        shot: shotCount,
        whip: whipState,
        isWeak: isWeak
    };

    onAdd(item, displayOptions, quantity, backendOptionsList);
    onClose();
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
          className="fixed inset-y-[20%] inset-x-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-grow flex overflow-hidden">
            {/* 왼쪽: 이미지 및 수량 */}
            <div className="w-2/5 p-6 flex flex-col items-center justify-center border-r">
              <div className="w-48 h-48 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
                <img
                    src={item.img || "/images/no-image.png"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300?text=No+Image")}
                />
              </div>
              <h3 className="font-bold text-3xl text-center leading-tight mb-2">{item.name}</h3>
              <p className="text-red-600 font-bold text-4xl mb-6">
                {finalPrice.toLocaleString()}원
              </p>

              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
                  <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="text-3xl font-light hover:text-red-500">-</button>
                  <span className="font-bold text-2xl w-10 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(prev => prev + 1)} className="text-3xl font-light hover:text-red-500">+</button>
                </div>
              </div>
            </div>

            {/* 오른쪽: 옵션 선택 */}
            <div className="w-3/5 p-6 overflow-y-auto">
              {item.category === '디저트' || item.originalCategory?.includes('디저트') ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p className="text-lg">옵션이 없는 메뉴입니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* 1. 온도 */}
                  <div className="py-4 border-b">
                    <h4 className="font-bold text-xl mb-3 text-center">온도(Hot / Ice)</h4>
                    <div className="flex gap-2">
                      <button onClick={() => setTempState('hot')} className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${tempState === 'hot' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-3xl">🔥</span><span className="text-lg font-semibold">Hot</span>
                      </button>
                      <button onClick={() => setTempState('ice')} className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${tempState === 'ice' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-3xl">❄️</span><span className="text-lg font-semibold">Ice</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. 사이즈 (가격 변동) */}
                  <div className="py-4 border-b">
                    <h4 className="font-bold text-xl mb-3 text-center">사이즈</h4>
                    <div className="flex gap-2">
                      {['tall', 'grande', 'venti'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSizeState(size as any)}
                          className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${sizeState === size ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                        >
                          <span className="text-3xl">🥤</span>
                          <span className="capitalize text-lg font-semibold">
                            {size} 
                            {size === 'tall' && <span className="text-sm text-blue-500 block">(-500원)</span>}
                            {size === 'venti' && <span className="text-sm text-red-500 block">(+500원)</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. 얼음 */}
                  {tempState === 'ice' && (
                    <div className="py-4 border-b">
                      <h4 className="font-bold text-xl mb-3 text-center">얼음 양</h4>
                      <div className="flex gap-2">
                        {['less', 'normal', 'more'].map((ice) => (
                          <button key={ice} onClick={() => setIceState(ice as any)} className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${iceState === ice ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <span className="text-3xl">🧊</span>
                            <span className="capitalize text-lg font-semibold">{ice === 'less' ? '적게' : ice === 'normal' ? '보통' : '많게'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. 샷 추가 */}
                  <div className="py-4 border-b">
                    <h4 className="font-bold text-xl mb-3 text-center">샷 추가 (+500원)</h4>
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => { setIsWeak(!isWeak); if (!isWeak) setShotCount(0); }} className={`flex flex-col items-center px-6 py-2 rounded-lg border-2 ${isWeak ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-3xl">💧</span><span className="text-lg font-semibold">연하게</span>
                      </button>
                      <div className="flex items-center gap-5 bg-white rounded-full px-5 py-3 border border-gray-200 shadow-sm">
                        <button onClick={() => setShotCount(prev => Math.max(0, prev - 1))} className="text-2xl hover:text-red-500">-</button>
                        <span className="font-bold text-2xl w-8 text-center">{shotCount}</span>
                        <button onClick={() => { setShotCount(prev => prev + 1); setIsWeak(false); }} className="text-2xl hover:text-red-500">+</button>
                      </div>
                    </div>
                  </div>

                  {/* 5. 휘핑 */}
                  <div className="py-4">
                    <h4 className="font-bold text-xl mb-3 text-center">휘핑</h4>
                    <div className="flex gap-2">
                      <button onClick={() => setWhipState(true)} className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${whipState ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-3xl">🍦</span><span className="text-lg font-semibold">추가</span>
                      </button>
                      <button onClick={() => setWhipState(false)} className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 ${!whipState ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-3xl">🚫</span><span className="text-lg font-semibold">없음</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 border-t bg-white">
            <button onClick={onClose} className="w-full bg-white text-gray-500 border-2 border-gray-300 hover:bg-gray-50 py-4 font-bold text-xl transition-colors">취소</button>
            <button onClick={handleAddToCart} className="w-full bg-gray-900 hover:bg-black text-white py-4 font-bold text-xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center leading-none gap-1">
              <span>주문 담기</span>
              <span className="text-sm font-normal text-gray-300">{finalPrice.toLocaleString()}원</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}