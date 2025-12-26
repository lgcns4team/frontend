// src/pages/EasyOrder.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';

import EasyMenuGrid from '../components/EasyMenuGrid';
import EasyBeverageOptionsModal from '../components/EasyOptionsModal';
import BottomCart from '../components/BottomCart'; //  추가

// 네가 Order/VoiceOrder에서 쓰던 아이콘 그대로
import microphoneIcon from '../assets/icons/microphone.svg';
import fingerIcon from '../assets/icons/finger.svg';

import type { MenuItem, Options } from '../types'; // 네 프로젝트 타입 경로에 맞춰 조정

type EasyCategory = {
  name: string;
  emoji: string;
  // 필요하면 category 매핑 키 추가 가능
};

const EASY_CATEGORIES: EasyCategory[] = [
  { name: '커피', emoji: '☕️' },
  { name: '차', emoji: '🍵' },
  { name: '다른 음료', emoji: '🥤' },
  { name: '디저트', emoji: '🍰' },
  { name: '추천메뉴', emoji: '⭐️' },
  { name: '세트메뉴', emoji: '🍿' },
];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { items, basicItems, recommendedItems, categories, isLoading } = useMenu();
  const { cart, addToCart } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  //  BottomCart에서 쓰는 주문방법 상태 (Order/VoiceOrder랑 동일)
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');

  // 쉬운주문에서 “다른 음료”를 기존 데이터의 어떤 카테고리로 볼지 정리(프로젝트마다 다름)
  const mappedCategory = useMemo(() => {
    if (!selectedCategory) return null;
    if (selectedCategory === '다른 음료') return '음료';
    return selectedCategory;
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    if (!mappedCategory) return [];

    // 추천메뉴는 recommendedItems 사용
    if (mappedCategory === '추천메뉴') return recommendedItems;

    // 그 외는 basicItems에서 category로 필터
    return basicItems.filter((it) => it.category === mappedCategory);
  }, [mappedCategory, recommendedItems, basicItems]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
        {/* 1) 헤더 (너가 쓰던 그대로) */}
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>

          <button
            onClick={() => navigate('/')}
            className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-8 h-8" />
            <span>처음으로</span>
          </button>
        </header>

        {/*  2) 상단 네비 버튼 영역 (Order/VoiceOrder 방식 그대로) */}
        <div className="bg-white pb-2 shadow-sm z-10 shrink-0">
          <div className="flex gap-3 px-4 py-3">
            {/* 일반 주문 */}
            <button
              onClick={() => navigate('/order')}
              className="flex-1 bg-pink-50 p-8 rounded-xl border border-pink-100 flex items-center gap-2 justify-center relative hover:bg-pink-100 hover:border-pink-200 transition-colors group"
            >
              <style>{`
                .wave-bar {
                  animation: wave 1s linear infinite;
                  animation-delay: calc(1s - var(--delay));
                  opacity: 0.7;
                  transition: opacity 0.3s ease;
                }
                .group:hover .wave-bar { opacity: 1; }
                @keyframes wave {
                  0% { transform: scale(0); }
                  50% { transform: scale(1); }
                  100% { transform: scale(0); }
                }
                .mic-icon { animation: micPulse 1.5s ease-in-out infinite; }
                @keyframes micPulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
              `}</style>

              <img src={microphoneIcon} alt="microphone" className="mic-icon w-10 h-10" />
              <span className="font-bold text-pink-900 text-xl">일반 주문</span>
            </button>

            {/* 음성 주문 */}
            <button
              onClick={() => navigate('/voice')}
              className="flex-1 bg-orange-50 p-8 rounded-xl border border-orange-100 flex items-center gap-2 justify-center hover:bg-orange-100 hover:border-orange-200 transition-colors group easy-button"
            >
              <style>{`
                .easy-button { animation: easyButtonGlow 0.8s ease-in-out infinite; }
                @keyframes easyButtonGlow {
                  0%, 100% { 
                    border-color: rgb(254, 208, 121);
                    background-color: rgb(254, 245, 230);
                    box-shadow: 0 0 0 0px rgba(217, 119, 6, 0);
                  }
                  50% { 
                    border-color: rgb(217, 119, 6);
                    background-color: rgb(255, 251, 235);
                    box-shadow: 0 0 12px 2px rgba(217, 119, 6, 0.3);
                  }
                }
                .finger-icon {
                  animation: fingerWiggle 0.8s ease-in-out infinite;
                  transform-origin: bottom center;
                }
                @keyframes fingerWiggle {
                  0%, 100% { transform: rotate(0deg); }
                  25% { transform: rotate(-8deg); }
                  75% { transform: rotate(8deg); }
                }
              `}</style>

              <img src={fingerIcon} alt="finger" className="finger-icon w-12 h-12" />
              <span className="font-bold text-orange-900 text-xl">음성 주문</span>
            </button>
          </div>
        </div>

        {/* 3) 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl pb-8">
                  {EASY_CATEGORIES.map((cat) => {
                    const isOtherBeverage = cat.name === '다른 음료';

                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center aspect-square hover:bg-orange-100 hover:border-orange-400 border-6 border-transparent transition-all duration-200"
                      >
                        <span className={`text-[10rem] mb-6 ${isOtherBeverage ? '-mt-6' : ''}`}>
                          {cat.emoji}
                        </span>

                        {isOtherBeverage ? (
                          <span className="text-6xl font-extrabold leading-[1.05] text-center">
                            <span className="block">다른</span>
                            <span className="block">음료</span>
                          </span>
                        ) : (
                          <span
                            className="text-6xl font-extrabold whitespace-nowrap break-keep leading-none"
                            style={{ writingMode: 'horizontal-tb' }}
                          >
                            {cat.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-3xl font-extrabold bg-gray-200 hover:bg-gray-300 px-8 py-4 rounded-2xl"
                >
                  ← 뒤로
                </button>

                <div className="text-5xl font-extrabold">{selectedCategory}</div>

                <button
                  onClick={() => navigate('/easy/confirm')}
                  className="text-3xl font-extrabold bg-pink-400 hover:bg-pink-500 text-white px-8 py-4 rounded-2xl"
                >
                  주문확인 →
                </button>
              </div>

              {isLoading ? (
                <div className="h-full flex items-center justify-center text-3xl font-bold">
                  메뉴 불러오는 중...
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pb-6">
                  <EasyMenuGrid
                    items={filteredItems}
                    onItemClick={(item) => {
                      // 커피/음료만 옵션 모달 띄우고, 그 외는 바로 담기
                      if (item.category === '커피' || item.category === '음료') {
                        setSelectedItem(item);
                      } else {
                        addToCart(item);
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>
        {cart.length > 0 && (
          <BottomCart
            onCheckout={() => navigate('/easy/confirm')}
            orderMethod="dine-in"
            onOrderMethodChange={() => {}}
          />
        )}
        {/* 5) 옵션 모달 */}
        <EasyBeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, opts: Pick<Options, 'temperature'>, qty) => {
            addToCart(item, opts, qty);
            setSelectedItem(null);
          }}
        />
      </div>
    </div>
  );
}
