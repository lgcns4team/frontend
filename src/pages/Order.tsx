import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
              className="flex-1 bg-pink-50 p-3 rounded-xl border border-pink-100 flex items-center gap-2 justify-center relative hover:bg-pink-100 hover:border-pink-200 transition-colors group"
            >
              <style>{`
                .wave-bar {
                  animation: wave 1s linear infinite;
                  animation-delay: calc(1s - var(--delay));
                  opacity: 0.7;
                  transition: opacity 0.3s ease;
                }
                .group:hover .wave-bar {
                  opacity: 1;
                }
                @keyframes wave {
                  0% { transform: scale(0); }
                  50% { transform: scale(1); }
                  100% { transform: scale(0); }
                }
              `}</style>
              <div className="flex gap-1 items-end justify-center h-6">
                <div
                  className="wave-bar rounded-full w-1 h-3 bg-pink-500/60"
                  style={{ '--delay': '0.2s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-1 bg-pink-700/60"
                  style={{ '--delay': '0.4s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-2 bg-pink-600/60"
                  style={{ '--delay': '0.7s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-4 bg-pink-600/60"
                  style={{ '--delay': '0.6s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-5 bg-pink-500/60"
                  style={{ '--delay': '0.5s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-4 bg-pink-600/60"
                  style={{ '--delay': '0.6s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-2 bg-pink-600/60"
                  style={{ '--delay': '0.7s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-1 bg-pink-700/60"
                  style={{ '--delay': '0.4s' } as React.CSSProperties}
                ></div>
                <div
                  className="wave-bar rounded-full w-1 h-3 bg-pink-500/60"
                  style={{ '--delay': '0.2s' } as React.CSSProperties}
                ></div>
              </div>
              <span className="font-bold text-pink-900 text-lg">음성 주문</span>
            </button>
            <button
              onClick={() => navigate('/easy')}
              className="flex-1 bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center gap-2 justify-center animate-pulseGlow"
            >
              <span className="text-2xl animate-[wiggle_1s_ease-in-out_infinite]">👉</span>{' '}
              <span className="font-bold text-orange-900 text-lg">쉬운 주문</span>
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
