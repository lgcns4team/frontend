import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';
import MenuGrid from '../components/MenuGrid';
import BeverageOptionsModal from '../components/BeverageOptionsModal';
import BottomCart from '../components/BottomCart';
import CartSheet from '../components/CartSheet';
import MicrophoneIcon from '../assets/icons/microphone.svg';
import FingerIcon from '../assets/icons/finger.svg';
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
          <button
            onClick={() => navigate('/')}
            className="text-base text-gray-400 underline hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <span className="text-3xl">🏠</span> <span className="font-bold">처음으로</span>
          </button>
        </header>

        {/* 2. 접근성 & 카테고리 */}
        <div className="bg-white pb-2 shadow-sm z-10 shrink-0">
          <div className="flex gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/voice')}
              className="flex-1 bg-pink-50 p-6 rounded-xl border border-pink-100 flex items-center gap-2 justify-center relative hover:bg-pink-100 hover:border-pink-200 transition-colors group"
            >
              <img
                src={MicrophoneIcon}
                alt="마이크"
                className="w-12 h-12 animate-micScale"
                style={{ filter: 'hue-rotate(-10deg) saturate(1.3) brightness(0.8)' }}
              />
              <span className="font-semibold text-pink-900 text-xl">음성 주문</span>
            </button>
            <button
              onClick={() => navigate('/easy')}
              className="flex-1 bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center gap-2 justify-center animate-pulseGlow"
            >
              <img
                src={FingerIcon}
                alt="손가락"
                className="w-14 h-14 animate-fingerTap"
                style={{ filter: 'hue-rotate(-20deg) saturate(1.5) brightness(0.7)' }}
              />
              <span className="font-semibold text-orange-600 text-xl">쉬운 주문</span>
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
