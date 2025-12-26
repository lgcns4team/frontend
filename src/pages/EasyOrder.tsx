// src/pages/EasyOrder.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';
import BottomCart from '../components/BottomCart';
import EasyMenuGrid from '../components/EasyMenuGrid';
import EasyBeverageOptionsModal from '../components/EasyOptionsModal';
import type { MenuItem, Options } from '../types';

const EASY_CATEGORIES = [
  { name: '커피', emoji: '☕️' },
  { name: '차', emoji: '🫖' },
  { name: '다른음료', emoji: '🥤' },
  { name: '디저트', emoji: '🍰' },
  { name: '추천메뉴', emoji: '🍊' },
  { name: '세트메뉴', emoji: '🍽️' },
];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { items, isLoading } = useMenu();
  const { cart, addToCart } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];

    switch (selectedCategory) {
      case '커피':
        return items.filter((item) => item.category === '커피');

      // "다른음료"는 원본 category가 "음료"인 것들을 보여줌
      case '다른음료':
        return items.filter((item) => item.category === '음료');

      case '차':
        return items.filter((item) => item.name.includes('티'));

      case '디저트':
      case '추천메뉴':
      case '세트메뉴':
        return items.filter((item) => item.category === '디저트');
      default:
        return [];
    }
  }, [selectedCategory, items]);

  const handleItemClick = (item: MenuItem) => {
    if (item.category === '커피' || item.category === '음료') {
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

  // 카테고리 화면에서는 cart 있을 때만 BottomCart 보이게
  const shouldShowBottomCart = !selectedCategory ? cart.length > 0 : true;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
        {/* 메인(Order) 페이지와 동일한 헤더 */}
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

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl pb-8">
                  {EASY_CATEGORIES.map((cat) => {
                    const isOtherBeverage = cat.name === '커피 외 음료';

                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center aspect-square hover:bg-orange-100 hover:border-orange-400 border-6 border-transparent transition-all duration-200"
                      >
                        {/* 이모지: '커피 외 음료'만 위로 */}
                        <span className={`text-[10rem] mb-6 ${isOtherBeverage ? '-mt-6' : ''}`}>
                          {cat.emoji}
                        </span>

                        {/* 텍스트: '커피 외 음료'만 3줄로 */}
                        {isOtherBeverage ? (
                          <span className="text-6xl font-extrabold leading-[1.05] text-center">
                            <span className="block">커피</span>
                            <span className="block">외</span>
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
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-2xl font-bold text-gray-700"
                >
                  <ArrowLeft className="w-8 h-8" />
                  <span>뒤로가기</span>
                </button>

                <h2 className="text-5xl font-bold text-center flex-1">{selectedCategory}</h2>
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

        {/* 하단 장바구니 */}
        {shouldShowBottomCart && <BottomCart onCheckout={() => navigate('/easy/confirm')} />}

        {/* 옵션 모달 */}
        <EasyBeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddWithOptions}
        />
      </div>
    </div>
  );
}
