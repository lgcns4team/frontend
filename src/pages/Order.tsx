import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Sparkles } from 'lucide-react';
// 컴포넌트들 Import
import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';
import MenuGrid from '../components/MenuGrid';
import BeverageOptionsModal from '../components/BeverageOptionsModal';
import BottomCart from '../components/BottomCart';
import CartSheet from '../components/CartSheet';
import type { MenuItem } from '../types';

export default function Order() {
  const navigate = useNavigate();
  const { items, categories, isLoading } = useMenu();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [activeCategory, setActiveCategory] = useState('추천메뉴');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const filteredItems = useMemo(() => {
    return activeCategory === '추천메뉴'
      ? items
      : items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  return (
    // 90도 회전 래퍼
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl">
        {/* 1. 헤더 */}
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">
            홈으로
          </button>
        </header>

        {/* 2. 접근성 & 카테고리 */}
        <div className="bg-white pb-2 shadow-sm z-10 shrink-0">
          <div className="flex gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/voice')}
              className="flex-1 bg-pink-50 p-3 rounded-xl border border-pink-100 flex items-center gap-2 justify-center"
            >
              <Volume2 className="text-pink-500 w-6 h-6" />{' '}
              <span className="font-bold text-pink-600 text-lg">음성주문</span>
            </button>
            <button
              onClick={() => navigate('/easy')}
              className="flex-1 bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center gap-2 justify-center"
            >
              <Sparkles className="text-orange-500 w-6 h-6" />{' '}
              <span className="font-bold text-orange-600 text-lg">쉬운주문</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-lg transition-colors ${
                  activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 메인 메뉴 리스트 */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 no-scrollbar">
          {isLoading ? (
            <div className="h-full flex justify-center items-center text-xl">
              메뉴를 불러오는 중...
            </div>
          ) : (
            <MenuGrid
              items={filteredItems}
              onItemClick={(item) => {
                if (item.category === '커피' || item.category === '음료') setSelectedItem(item);
                else addToCart(item);
              }}
            />
          )}
        </main>

        {/* 4. 하단 고정 바 (BottomCart) */}
        <BottomCart onCheckout={() => setIsCartOpen(true)} />

        {/* 5. 옵션 모달 */}
        <BeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, opts, qty) => {
            addToCart(item, opts, qty);
            setSelectedItem(null);
          }}
        />

        <CartSheet
          isOpen={isCartOpen}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => {
            navigate('/payment'); // 실제 이동
          }}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onRemoveItem={removeFromCart}
        />
      </div>
    </div>
  );
}
