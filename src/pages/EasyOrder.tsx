// src/pages/EasyOrder.tsx
import { useLayoutEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import microphoneIcon from '../assets/icons/microphone.svg';
import fingerIcon from '../assets/icons/finger.svg';

import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';

import BottomCart from '../components/BottomCart';
import EasyMenuGrid from '../components/EasyMode/EasyMenuGrid';
import EasyBeverageOptionsModal from '../components/EasyMode/EasyOptionsModal';

import type { MenuItem, Options } from '../types';
import { useAnalysisStore } from '../store/analysisStore';

// AI Core Base URL
const AI_CORE_BASE_URL = 'http://127.0.0.1:8000/nok-nok';

// 기준 화면 크기 (9:16 비율)
const BASE_WIDTH = 900;
const BASE_HEIGHT = 1600;

type EasyCategoryKey = 'COFFEE' | 'DRINK' | 'DESSERT' | 'RECOMMEND';
const EASY_CATEGORIES: {
  key: EasyCategoryKey;
  name: string;
  image: string;
}[] = [
  { key: 'COFFEE', name: '커피', image: '/images/menu/coldbrew.png' },
  { key: 'DRINK', name: '음료', image: '/images/menu/grapefruit_ade.png' },
  { key: 'DESSERT', name: '디저트', image: '/images/menu/cheese_cake.png' },
  { key: 'RECOMMEND', name: '추천메뉴', image: '/images/menu/cookie_set.png' },
];

export default function EasyOrder() {
  const navigate = useNavigate();

  // [수정 1] 얼굴 인식 스토어에서 데이터 추출 (괄호/중괄호 주의)
  const { gender, age, setAnalysis, clearAnalysis, isSenior } = useAnalysisStore((s) => ({
    gender: s.gender,
    age: s.age,
    setAnalysis: s.setAnalysis,
    clearAnalysis: s.clearAnalysis,
    isSenior: s.isSenior,
  }));

  // [수정 2] 연령대 계산 (예: 23 -> "20s")
  const ageGroup = age ? `${Math.floor(age / 10) * 10}s` : undefined;

  // [수정 3] useMenu 호출 시 성별과 연령대 전달 (중복 선언 없이 이 부분만 유지)
  const { items, recommendedItems, isLoading } = useMenu(
    gender || undefined,
    ageGroup
  );

  const { cart, addToCart, updateCartOptions } = useCartStore();

  const [scale, setScale] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EasyCategoryKey | null>(null);
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editCartId, setEditCartId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<
    (MenuItem & { options?: Pick<Options, 'temperature'> }) | null
  >(null);

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return '';
    const c = EASY_CATEGORIES.find((c) => c.key === selectedCategory);
    return c ? ` ${c.name}` : '';
  }, [selectedCategory]);

  const [isLoadingFaceData, setIsLoadingFaceData] = useState(false);

  // [수정 4] 추천 메뉴 선택 시 recommendedItems 반환 로직 연결
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];

    switch (selectedCategory) {
      case 'COFFEE':
        return items.filter((item: any) => item.categoryId === 1);
      case 'DRINK':
        return items.filter((item: any) => item.categoryId === 2);
      case 'DESSERT':
        return items.filter((item: any) => item.categoryId === 3);
      case 'RECOMMEND':
        // 일반 주문과 동일하게 맞춤 추천 리스트 사용
        return recommendedItems || [];
      default:
        return [];
    }
  }, [selectedCategory, items, recommendedItems]);

  const handleItemClick = (item: MenuItem) => {
    // 옵션모달 띄울 대상: 커피(1), 음료(2)
    const cid = (item as any).categoryId;
    if (cid === 1 || cid === 2) {
      setSelectedItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleAddWithOptions = (
    item: MenuItem,
    options: Pick<Options, 'temperature'>,
    quantity: number
  ) => {
    addToCart(item, options, quantity);
    setSelectedItem(null);
  };

  const handleEditOptions = (cartId: string) => {
    const target = cart.find((c: any) => c.cartId === cartId);
    if (!target) return;

    setEditCartId(cartId);
    setEditItem({
      ...(target as any),
      options: (target as any).options ?? { temperature: 'cold' },
    });
  };

  const shouldShowBottomCart = !selectedCategory ? cart.length > 0 : true;

  // 🎯 반응형 스케일 계산
  useLayoutEffect(() => {
    const calculateScale = () => {
      const scaleX = window.innerWidth / BASE_WIDTH;
      const scaleY = window.innerHeight / BASE_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // scale이 계산되지 않았을 때는 아무것도 보여주지 않음 (흰 화면)
  // 아주 찰나의 순간이라 사용자는 인지하지 못하고 바로 완성된 화면을 보게 됩니다.
  if (scale === null) return null;

  // 🆕 처음으로 버튼: 최신 얼굴 인식 데이터를 가져와서 적용
  const handleGoHome = async () => {
    if (isLoadingFaceData) return;
    setIsLoadingFaceData(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);

      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        clearAnalysis();
      }
    } catch (err) {
      clearAnalysis();
    } finally {
      setIsLoadingFaceData(false);
    }
    // 쉬운 주문 모드이므로 처음 화면(카테고리 선택)으로 돌아가거나 메인으로 이동
    // 여기서는 기존 로직대로 '/order'로 이동하지만, 필요시 '/'나 '/easy'로 변경 가능
    navigate('/order');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50"
    >
      <div
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="origin-center bg-white flex flex-col shadow-2xl"
      >
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
          <button
            onClick={handleGoHome}
            disabled={isLoadingFaceData}
            className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-8 h-8" />
            <span>처음으로</span>
          </button>
        </header>

        <div className="bg-white pb-2 shadow-sm z-10 shrink-0">
          <div className="flex gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/voice')}
              className="flex-1 bg-pink-50 p-8 rounded-xl border border-pink-100 flex items-center gap-2 justify-center relative hover:bg-pink-100 hover:border-pink-200 transition-colors group"
            >
              <style>{`
                .mic-icon { animation: micPulse 1.5s ease-in-out infinite; }
                @keyframes micPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
              `}</style>
              <img src={microphoneIcon} alt="microphone" className="mic-icon w-10 h-10" />
              <span className="font-bold text-pink-900 text-xl">음성 주문</span>
            </button>

            <button
              onClick={() => navigate('/order')}
              className={`flex-1 bg-orange-50 p-8 rounded-xl border border-orange-100 flex items-center gap-2 justify-center
                hover:bg-orange-100 hover:border-orange-200 active:bg-orange-200 active:scale-[0.99]
                transition-all duration-200 group
                ${isSenior ? 'easy-button' : ''}
              `}
            >
              {isSenior && (
                <style>{`
                  .easy-button { animation: easyButtonGlow 0.8s ease-in-out infinite; }
                  @keyframes easyButtonGlow {
                    0%, 100% { border-color: rgb(254, 208, 121); background-color: rgb(254, 245, 230); box-shadow: 0 0 0 0px rgba(217, 119, 6, 0); }
                    50% { border-color: rgb(217, 119, 6); background-color: rgb(255, 251, 235); box-shadow: 0 0 12px 2px rgba(217, 119, 6, 0.3); }
                  }
                  .finger-icon { animation: fingerWiggle 0.8s ease-in-out infinite; transform-origin: bottom center; }
                  @keyframes fingerWiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
                `}</style>
              )}
              <img
                src={fingerIcon}
                alt="finger"
                className={`${isSenior ? 'finger-icon ' : ''}w-12 h-12`}
              />
              <span className="font-bold text-orange-900 text-xl">일반 주문</span>
            </button>
          </div>
        </div>

        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 w-full max-w-[720px] pb-2 mx-auto place-content-start">
                  {EASY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center h-[420px] hover:bg-orange-100 hover:border-orange-400 border-6 border-transparent transition-all duration-200"
                    >
                      <div className="w-[280px] h-[280px] mb-6 flex items-center justify-center overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>
                      <span className="text-6xl font-extrabold whitespace-nowrap break-keep leading-none">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-2xl font-bold text-gray-700"
                >
                  <ArrowLeft className="w-8 h-8" />
                  <span>뒤로가기</span>
                </button>
                <h2 className="text-5xl font-bold text-center flex-1">{selectedCategoryLabel}</h2>
                <div className="w-[140px]" />
              </div>

              {isLoading ? (
                <div className="text-center text-2xl">메뉴를 불러오는 중입니다...</div>
              ) : (
                <EasyMenuGrid items={filteredItems} onItemClick={handleItemClick} />
              )}
            </div>
          )}
        </main>

        {shouldShowBottomCart && (
          <BottomCart
            onCheckout={() =>
              navigate('/easy/confirm', {
                state: { orderMethod },
              })
            }
            onEditOptions={handleEditOptions}
            orderMethod={orderMethod}
            onOrderMethodChange={setOrderMethod}
          />
        )}

        <EasyBeverageOptionsModal
          open={Boolean(selectedItem || editItem)}
          item={selectedItem ?? editItem}
          onClose={() => {
            setSelectedItem(null);
            setEditItem(null);
            setEditCartId(null);
          }}
          onAdd={(item, options, quantity) => {
            if (editCartId) {
              updateCartOptions(editCartId, options);
              setEditItem(null);
              setEditCartId(null);
              return;
            }
            handleAddWithOptions(item, options, quantity);
          }}
        />
      </div>
    </motion.div>
  );
}