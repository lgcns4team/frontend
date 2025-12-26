import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/UseCartStore';
import type { CartItem } from '../types/OrderTypes'; // [수정] CartItem 타입 사용

interface Props {
  onCheckout: () => void;
  onEditOptions?: (cartId: string) => void;
  orderMethod?: 'dine-in' | 'takeout';
  onOrderMethodChange?: (method: 'dine-in' | 'takeout') => void;
}

export default function BottomCart({
  onCheckout,
  onEditOptions,
  orderMethod = 'dine-in',
  onOrderMethodChange,
}: Props) {
  const { cart, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  // [수정 1] 옵션 렌더링 로직 (한글 옵션명 표시)
  const renderOptions = (item: CartItem) => {
    // 디저트는 옵션 표시 안 함
    if (item.category === '디저트' || item.category === 'Dessert') return null;

    // selectedBackendOptions에 있는 한글 이름(name) 사용
    if (item.selectedBackendOptions && item.selectedBackendOptions.length > 0) {
      return item.selectedBackendOptions.map(opt => {
        // 수량이 2개 이상이면 '샷추가(2)' 형태로, 아니면 이름만
        return opt.quantity > 1 ? `${opt.name}(${opt.quantity})` : opt.name;
      }).join(' / ');
    }
    return null;
  };

  // [수정 2] 개별 아이템 가격 계산 (기본가 + 옵션가)
  const getItemTotalPrice = (item: CartItem) => {
    const optionsPrice = item.selectedBackendOptions?.reduce((acc, opt) => acc + (opt.price * opt.quantity), 0) || 0;
    return (item.price + optionsPrice) * item.quantity;
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-30 flex flex-col h-[500px] shrink-0">
      {/* 1. 헤더 */}
      <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-3 text-gray-700">
          <ShoppingCart className="w-7 h-7" />
          <span className="font-semibold text-lg">주문 내역</span>
          {cart.length > 0 && (
            <span className="bg-orange-500 text-white text-base font-bold px-3 py-1 rounded-full">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </div>

        {/* 중앙: 주문방법 선택 */}
        <div className="flex gap-8">
          <button
            onClick={() => onOrderMethodChange?.('dine-in')}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
              orderMethod === 'dine-in'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            매장
          </button>
          <button
            onClick={() => onOrderMethodChange?.('takeout')}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
              orderMethod === 'takeout'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            포장
          </button>
        </div>

        {/* 오른쪽: 전체 삭제 */}
        <div className="w-16 text-center">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-base text-gray-400 underline hover:text-red-500 text-sm font-semibold transition-colors"
            >
              전체 삭제
            </button>
          )}
        </div>
      </div>

      {/* 2. 장바구니 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <AnimatePresence>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <span className="text-lg">선택된 메뉴가 없습니다</span>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.cartId}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-gray-800 text-m">{item.name}</span>
                  
                  {/* [수정] 옵션 텍스트 렌더링 */}
                  <span className="text-gray-400 text-sm mt-0.5 font-semibold">
                    {renderOptions(item)}
                  </span>
                  
                  {/* [수정] 정확한 가격 표시 */}
                  <span className="text-gray-500 text-sm mt-1">
                    {getItemTotalPrice(item).toLocaleString()}원
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 옵션 수정 버튼 */}
                  {item.category && item.category !== '디저트' && item.category !== 'Dessert' && (
                    <button
                      onClick={() => onEditOptions?.(item.cartId)}
                      className="h-9 flex items-center px-6 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      옵션 변경
                    </button>
                  )}

                  {/* 수량 조절 */}
                  <div className="h-9 flex items-center gap-3 bg-white rounded-lg px-3 border border-gray-200 shadow-sm">
                    <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 hover:bg-gray-100 rounded">
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-bold text-lg w-7 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 hover:bg-gray-100 rounded">
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 3. 총 결제금액 */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-4 h-[110px] shrink-0">
        <div className="flex-1 bg-gray-900 text-white rounded-3xl flex flex-col justify-center px-8 shadow-lg">
          <span className="text-gray-400 text-sm font-medium mb-1">총 결제금액</span>
          <span className="text-2xl font-extrabold tracking-tight">
            {getTotalPrice().toLocaleString()}
            <span className="text-xl ml-1 font-bold text-gray-400">원</span>
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-[40%] rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl ${
            cart.length > 0 ? 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer transform hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="text-xl font-bold">주문 확인</span>
        </button>
      </div>
    </div>
  );
}