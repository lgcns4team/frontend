import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';
import MenuGrid from '../components/MenuGrid';
import BeverageOptionsModal from '../components/OptionsModal';
import BottomCart from '../components/BottomCart';
import CartSheet from '../components/CartSheet';
import AdSlideshow from '../components/AdSlideshow';
import microphoneIcon from '../assets/icons/microphone.svg';
import fingerIcon from '../assets/icons/finger.svg';
import type { MenuItem } from '../types';

export default function Order() {
  const navigate = useNavigate();
  const { items, categories, isLoading } = useMenu();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [activeCategory, setActiveCategory] = useState('추천메뉴');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAdSlideshow, setShowAdSlideshow] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<number | null>(null);

  // 광고 닫기 핸들러 - Order 화면으로 돌아감
  const handleCloseAd = () => {
    setShowAdSlideshow(false);
    // 타이머 리셋은 useEffect에서 처리
  };

  // 옵션 수정 핸들러 - 장바구니에서 옵션 변경
  const handleEditOptions = (cartId: string) => {
    const cartItem = cart.find((item) => item.cartId === cartId);
    if (cartItem) {
      // 메뉴 정보 찾기
      const menuItem = items.find((item) => item.id === cartItem.id);
      if (menuItem) {
        setEditingCartId(cartId);
        setSelectedItem(menuItem);
      }
    }
  };

  // 무동작 감지 로직 (1분)
  useEffect(() => {
    // 광고가 표시 중이면 타이머를 추가로 설정하지 않음
    if (showAdSlideshow) return;

    const resetInactivityTimer = () => {
      // 기존 타이머 제거
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // 새로운 1분 타이머 설정
      const newTimer = setTimeout(() => {
        setShowAdSlideshow(true);
      }, 60000); // 1분

      setInactivityTimer(newTimer);
    };

    // 마우스/터치 이벤트 감지
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);

    // 초기 타이머 설정
    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('touchstart', resetInactivityTimer);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [showAdSlideshow, inactivityTimer]);

  const filteredItems = useMemo(() => {
    return activeCategory === '추천메뉴'
      ? items
      : items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  return (
    // 90도 회전 래퍼
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {showAdSlideshow && <AdSlideshow onClose={handleCloseAd} />}
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
                .mic-icon {
                  animation: micPulse 1.5s ease-in-out infinite;
                }
                @keyframes micPulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
              `}</style>
              <img src={microphoneIcon} alt="microphone" className="mic-icon w-8 h-8" />
              <span className="font-bold text-pink-900 text-lg">음성 주문</span>
            </button>
            <button
              onClick={() => navigate('/easy')}
              className="flex-1 bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center gap-2 justify-center hover:bg-orange-100 hover:border-orange-200 transition-colors group easy-button"
            >
              <style>{`
                .easy-button {
                  animation: easyButtonGlow 0.8s ease-in-out infinite;
                }
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
              <img src={fingerIcon} alt="finger" className="finger-icon w-8 h-8" />
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
        <BottomCart onCheckout={() => setIsCartOpen(true)} onEditOptions={handleEditOptions} />

        {/* 5. 옵션 모달 */}
        <BeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setEditingCartId(null);
          }}
          onAdd={(item, opts, qty) => {
            // 수정 모드인 경우
            if (editingCartId) {
              // 기존 항목 제거
              removeFromCart(editingCartId);
              // 새 옵션으로 다시 추가
              addToCart(item, opts, qty);
              setEditingCartId(null);
            } else {
              // 신규 추가 모드
              addToCart(item, opts, qty);
            }
            setSelectedItem(null);
          }}
        />

        <CartSheet
          isOpen={isCartOpen}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => {
            navigate('/payment', { state: { directToMethod: true } });
          }}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onRemoveItem={removeFromCart}
        />
      </div>
    </div>
  );
}
