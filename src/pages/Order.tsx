import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';
import MenuGrid from '../components/MenuGrid';
import BeverageOptionsModal from '../components/OptionsModal';
import BottomCart from '../components/BottomCart';
import OrderConfirmModal from '../components/OrderConfirmModal';
import microphoneIcon from '../assets/icons/microphone.svg';
import fingerIcon from '../assets/icons/finger.svg';
import type { MenuItem } from '../types/OrderTypes';

export default function Order() {
  const navigate = useNavigate();
  const { items, categories, isLoading } = useMenu();
  const { cart, addToCart, removeFromCart } = useCartStore();
  
  const [activeCategory, setActiveCategory] = useState('추천메뉴');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // [상태 추가] 주문 방법 (매장/포장)
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');
  // [상태 추가] 현재 수정 중인 카트 아이템 ID (옵션 변경 시 사용)
  const [editingCartId, setEditingCartId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  const isOptionMenu = (item: MenuItem) => {
    if (['커피', '음료'].includes(item.category)) return true;
    if (item.category === '추천메뉴' && item.originalCategory && ['커피', '음료'].includes(item.originalCategory)) return true;
    return false;
  };

  // [기능 추가] 옵션 변경 버튼 클릭 핸들러
  const handleEditOptions = (cartId: string) => {
    const itemToEdit = cart.find(item => item.cartId === cartId);
    if (itemToEdit) {
      setEditingCartId(cartId); // 수정 중인 ID 저장
      setSelectedItem(itemToEdit); // 해당 아이템으로 모달 열기
    }
  };

  // [기능 추가] 모달에서 '담기' 눌렀을 때 처리
  const handleAddToCartFromModal = (item: MenuItem, opts: any, qty: number, backendOptions: any[]) => {
    // 1. 만약 수정 중이었다면, 기존 아이템 삭제 (교체 효과)
    if (editingCartId) {
      removeFromCart(editingCartId);
    }
    // 2. 새 아이템 추가
    addToCart(item, opts, qty, backendOptions);
    
    // 3. 상태 초기화
    setSelectedItem(null);
    setEditingCartId(null);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setEditingCartId(null); // 수정 취소 시 ID도 초기화
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl">
        
        {/* 헤더 */}
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
          <button
            onClick={() => navigate('/')}
            className="text-base text-gray-400 underline hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <span className="text-3xl">🏠</span> <span className="font-bold">처음으로</span>
          </button>
        </header>

        {/* 상단 버튼 & 카테고리 */}
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
              onClick={() => navigate('/easy')}
              className="flex-1 bg-orange-50 p-8 rounded-xl border border-orange-100 flex items-center gap-2 justify-center hover:bg-orange-100 hover:border-orange-200 transition-colors group easy-button"
            >
              <style>{`
                .easy-button { animation: easyButtonGlow 0.8s ease-in-out infinite; }
                @keyframes easyButtonGlow { 0%, 100% { border-color: rgb(254, 208, 121); background-color: rgb(254, 245, 230); box-shadow: 0 0 0 0px rgba(217, 119, 6, 0); } 50% { border-color: rgb(217, 119, 6); background-color: rgb(255, 251, 235); box-shadow: 0 0 12px 2px rgba(217, 119, 6, 0.3); } }
                .finger-icon { animation: fingerWiggle 0.8s ease-in-out infinite; transform-origin: bottom center; }
                @keyframes fingerWiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
              `}</style>
              <img src={fingerIcon} alt="finger" className="finger-icon w-12 h-12" />
              <span className="font-bold text-orange-900 text-xl">쉬운 주문</span>
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

        {/* 메뉴 리스트 */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 no-scrollbar">
          {isLoading ? (
            <div className="h-full flex justify-center items-center text-xl">
              메뉴를 불러오는 중...
            </div>
          ) : (
            <MenuGrid
              items={filteredItems}
              onItemClick={(item) => {
                if (isOptionMenu(item)) {
                  setSelectedItem(item);
                } else { 
                  addToCart(item);
                }
              }}
            />
          )}
        </main>

        {/* 하단 장바구니 바 */}
        <BottomCart 
          onCheckout={() => setIsCartOpen(true)}
          onEditOptions={handleEditOptions}
          orderMethod={orderMethod}
          onOrderMethodChange={setOrderMethod}
        />

        {/* 옵션 모달 */}
        <BeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={handleCloseModal}
          onAdd={handleAddToCartFromModal}
        />

        {/* 주문 확인 모달 */}
        <OrderConfirmModal
          isOpen={isCartOpen}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onPrevious={() => setIsCartOpen(false)}
          onCheckout={() => {
            navigate('/payment', { state: { directToMethod: true } });
          }}
          onRemoveItem={removeFromCart}
        />
      </div>
    </div>
  );
}