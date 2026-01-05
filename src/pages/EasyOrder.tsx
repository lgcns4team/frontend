// src/pages/EasyOrder.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
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

type EasyCategoryKey = 'COFFEE' | 'DRINK' | 'DESSERT' | 'RECOMMEND';
const EASY_CATEGORIES: {
  key: EasyCategoryKey;
  name: string;
  image: string;
}[] = [
  { key: 'COFFEE', name: '커피', image: '/menu_images/coldbrew.png' },
  { key: 'DRINK', name: '음료', image: '/menu_images/grapefruit_ade.png' },
  { key: 'DESSERT', name: '디저트', image: '/menu_images/cheese_cake.png' },
  { key: 'RECOMMEND', name: '추천메뉴', image: '/menu_images/cookie_set.png' },
];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { items, recommendedItems, isLoading } = useMenu();
  const { cart, addToCart, updateCartOptions } = useCartStore();

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
    console.log('API items sample:', items.slice(0, 3));
    console.log('CART sample:', cart.slice(0, 3));
    return c ? ` ${c.name}` : '';
  }, [selectedCategory]);

  // 🆕 얼굴 인식 스토어
  const { setAnalysis, clearAnalysis, isSenior } = useAnalysisStore((s) => ({
    setAnalysis: s.setAnalysis,
    clearAnalysis: s.clearAnalysis,
    isSenior: s.isSenior,
  }));
  const [isLoadingFaceData, setIsLoadingFaceData] = useState(false);

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
        return recommendedItems;
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

  // 카테고리 화면에서는 cart 있을 때만 BottomCart 보이게
  const shouldShowBottomCart = !selectedCategory ? cart.length > 0 : true;

  // 🆕 처음으로 버튼: 최신 얼굴 인식 데이터를 가져와서 적용 (화면 이동 없음)
  const handleGoHome = async () => {
    if (isLoadingFaceData) return;

    setIsLoadingFaceData(true);
    console.log('🏠 처음으로 버튼 클릭: 최신 얼굴 인식 데이터 확인 중...');

    try {
      // 1. Python 서버에서 최신 얼굴 인식 데이터 가져오기 (타임아웃 3초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500); // 3초 타임아웃

      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('📥 최신 얼굴 인식 데이터 수신:', data);

        // 2. Zustand 스토어에 저장 (50세 이상 여부 자동 계산됨)
        setAnalysis(data);
        console.log('💾 스토어 업데이트 완료:', {
          age: data.age,
          gender: data.gender,
          isSenior: data.age >= 50,
        });
        console.log('✅ 50세 이상 전용 애니메이션 활성화:', data.age >= 50);
      } else {
        console.log('ℹ️ 서버에 얼굴 인식 데이터가 없습니다. 기존 데이터 초기화.');
        // 데이터가 없으면 초기화
        clearAnalysis();
      }
    } catch (err) {
      if (err === 'AbortError') {
        console.warn('⏱️ 데이터 가져오기 시간 초과 (1초)');
      } else {
        console.error('❌ 얼굴 인식 데이터 가져오기 실패:', err);
      }
      // 에러 발생 시 안전하게 초기화
      clearAnalysis();
    } finally {
      setIsLoadingFaceData(false);
    }

    // 🔄 데이터 처리 완료 후 Order 페이지로 이동
    navigate('/order');
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
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
        {/* 상단 버튼 (음성주문 / 일반주문) */}
        <div className="bg-white pb-2 shadow-sm z-10 shrink-0">
          <div className="flex gap-3 px-4 py-3">
            {/* 음성 주문 */}
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

            {/* 일반 주문 (현재 페이지라 강조만 하고 싶으면 disabled 추천) */}
            <button
              onClick={() => navigate('/order')}
              className={`flex-1 bg-orange-50 p-8 rounded-xl border border-orange-200 flex items-center gap-2 justify-center transition-colors group opacity-90 cursor-default ${
                isSenior ? 'easy-button' : ''
              }`}
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
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-40 h-40 mb-6 object-contain"
                        draggable={false}
                      />

                      <span
                        className="text-6xl font-extrabold whitespace-nowrap break-keep leading-none"
                        style={{ writingMode: 'horizontal-tb' }}
                      >
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
                state: {
                  orderMethod,
                },
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
    </div>
  );
}
