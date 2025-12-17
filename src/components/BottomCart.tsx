import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/UseCartStore';
import type { Options } from '../types';

interface Props {
  onCheckout: () => void;
  onEditOptions?: (cartId: string) => void;
}

export default function BottomCart({ onCheckout, onEditOptions }: Props) {
  // Zustand Store에서 상태와 함수들을 가져옵니다.
  const { cart, updateQuantity, clearCart, getCartTotalPrice } = useCartStore();

  // 옵션 글자 렌더링 헬퍼 함수
  const renderOptions = (options?: Partial<Options>, category?: string) => {
    if (!options || category === '디저트') return null;
    const parts: string[] = [];
    if (options.temperature) parts.push(options.temperature === 'hot' ? 'HOT' : 'ICE');
    if (options.size) parts.push(options.size);
    if (options.shot && options.shot > 0) parts.push(`샷추가(${options.shot})`);
    if (options.whip) parts.push('휘핑');
    if (options.isWeak) parts.push('연하게');
    return parts.join(' / ');
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-30 flex flex-col h-[500px] shrink-0">
      {/* 1. 장바구니 헤더 */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex items-center gap-3 text-gray-700">
          <ShoppingCart className="w-7 h-7" />
          <span className="font-bold text-m">주문 내역</span>
          {cart.length > 0 && (
            <span className="bg-orange-500 text-white text-base font-bold px-3 py-1 rounded-full">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-base text-gray-400 underline hover:text-red-500 text-sm font-semibold transition-colors"
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* 2. 장바구니 리스트 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-gray-50">
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
                  {/* 옵션 표시 */}
                  {item.options && (
                    <span className="text-gray-400 text-sm mt-0.5 font-semibold">
                      {renderOptions(item.options, item.category)}
                    </span>
                  )}
                  <span className="text-gray-500 text-sm mt-1">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 수량 버튼 */}
                  <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-bold text-lg w-7 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* 옵션 수정 버튼 */}
                  {item.category !== '디저트' && (
                    <button
                      onClick={() => onEditOptions?.(item.cartId)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      옵션 변경
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 3. 하단 총 결제금액 및 버튼 영역 */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-4 h-[110px] shrink-0">
        {/* 총 결제금액 (왼쪽) */}
        <div className="flex-1 bg-gray-900 text-white rounded-3xl flex flex-col justify-center px-8 shadow-lg">
          <span className="text-gray-400 text-sm font-medium mb-1">총 결제금액</span>
          <span className="text-2xl font-extrabold tracking-tight">
            {getCartTotalPrice().toLocaleString()}
            <span className="text-xl ml-1 font-bold text-gray-400">원</span>
          </span>
        </div>

        {/* 주문확인 버튼 (오른쪽) */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-[40%] rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl ${
            cart.length > 0
              ? 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer transform hover:scale-105 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="text-xl font-bold">주문 확인</span>
        </button>
      </div>
    </div>
  );
}
