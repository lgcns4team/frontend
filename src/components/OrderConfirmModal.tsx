import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import type { CartItem } from '../types/OrderTypes';

interface OrderConfirmModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onPrevious: () => void;
  onCheckout: () => void;
  onRemoveItem: (cartId: string) => void;
}

export default function OrderConfirmModal({
  isOpen,
  cart,
  onClose,
  onPrevious,
  onCheckout,
  onRemoveItem,
}: OrderConfirmModalProps) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* 모달 박스 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-y-[20%] inset-x-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-8 py-6 border-b-2 border-gray-200 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">주문 확인</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-8 h-8 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* 주문 내역 영역 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gray-50">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-20 h-20 opacity-20 mb-4" />
                  <span className="text-2xl font-semibold">주문 내역이 없습니다</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.name}</h3>
                        {item.category !== '디저트' && (
                          <p className="text-sm text-gray-500 mb-2 font-medium">
                            {item.options?.temperature === 'hot' ? '🔥 HOT' : '❄️ ICE'} ·{' '}
                            {item.options?.size?.toUpperCase() || 'GRANDE'}
                            {item.options?.shot ? ` · 샷+${item.options.shot}` : ''}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mb-2">수량: {item.quantity}개</p>
                        <p className="text-lg font-bold text-orange-600">
                          {(item.price * item.quantity).toLocaleString()}원
                        </p>
                      </div>

                      {/* 삭제 버튼만 유지 */}
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 총액 요약 */}
            {cart.length > 0 && (
              <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">주문 항목</span>
                  <span className="font-bold text-gray-900">{totalItems}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">총 결제금액</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex gap-3 px-8 py-5 border-t border-gray-200 bg-white shrink-0">
              <button
                onClick={onPrevious}
                className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-200 transition-colors"
              >
                이전
              </button>
              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="flex-1 py-4 bg-pink-500 text-white font-bold text-lg rounded-2xl hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                결제하기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
