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
  { name: '음료', emoji: '🥤' },
  { name: '차', emoji: '🫖' },
  { name: '디저트', emoji: '🍰' },
  { name: '추천메뉴', emoji: '🍊' },
  { name: '세트메뉴', emoji: '🍽️' },
];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { items, isLoading } = useMenu();
  const { addToCart } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];

    switch (selectedCategory) {
      case '커피':
      case '음료':
        return items.filter((item) => item.category === selectedCategory);
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
      // 음식류는 옵션 없이 바로 장바구니
      addToCart(item);
    }
  };

  const handleAddWithOptions = (
    item: MenuItem,
    options: Pick<Options, 'temperature'>,
    quantity: number
  ) => {
    // 여기서는 장바구니에만 담고, 화면 전환은 하지 않는다
    addToCart(item, options, quantity);
    setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
        {/* 헤더 */}
        <header className="flex items-center justify-between p-6 border-b-2">
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-3 text-2xl font-bold"
            >
              <ArrowLeft className="w-8 h-8" />
              <span>뒤로가기</span>
            </button>
          ) : (
            <h1 className="text-4xl font-extrabold">쉬운 주문</h1>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-2xl font-bold"
          >
            <Home className="w-8 h-8" />
            <span>처음으로</span>
          </button>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              {/* 🔹 위쪽 고정 제목 영역 */}
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              {/* 🔹 아래: 카테고리 카드 영역만 스크롤 */}
              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl pb-8">
                  {EASY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center aspect-square hover:bg-orange-100 hover:border-orange-400 border-6 border-transparent transition-all duration-200"
                    >
                      <span className="text-[10rem] mb-6">{cat.emoji}</span>
                      <span className="text-6xl font-extrabold">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // 메뉴 목록 화면
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-5xl font-bold text-center mb-10">{selectedCategory}</h2>
              {isLoading ? (
                <div className="text-center text-2xl">메뉴를 불러오는 중입니다...</div>
              ) : (
                <EasyMenuGrid items={filteredItems} onItemClick={handleItemClick} />
              )}
            </div>
          )}
        </main>

        {/* 하단 장바구니 -  여기서 주문확인이 EasyConfirm으로 이동 */}
        <BottomCart onCheckout={() => navigate('/easy/confirm')} />

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
