import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { CartItem } from '../types/OrderTypes';

interface CartSheetProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onClearCart: () => void;
  onRemoveItem: (cartId: string) => void;
}

export default function CartSheet({
  isOpen,
  cart,
  onClose,
  onCheckout,
  onUpdateQuantity,
  onClearCart,
  onRemoveItem,
}: CartSheetProps) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col h-[70vh]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-gray-800" />
                <span className="text-m font-bold">주문 내역</span>
                <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  {totalItems}
                </span>
              </div>
              <button onClick={onClose}>
                <X className="w-8 h-8 text-gray-400" />
              </button>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-16 h-16 opacity-20 mb-3" />
                  <span className="text-xl">비어있음</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                  >
                    <div className="p-3 flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                        {item.category !== '디저트' && (
                          <p className="text-sm text-gray-400 mb-2 font-semibold">
                            {item.options?.temperature === 'hot' ? 'HOT' : 'ICE'} /{'  '}
                            {item.options?.size?.toUpperCase()}
                            {item.options?.shot ? ` / 샷+${item.options.shot}` : ''}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">
                          {(item.price * item.quantity).toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm">
                          <button
                            onClick={() => onUpdateQuantity(item.cartId, -1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="w-5 h-5 text-gray-600" />
                          </button>
                          <span className="font-bold text-lg w-7 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.cartId, 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <button onClick={() => onRemoveItem(item.cartId)} className="text-red-400">
                          <X className="w-7 h-7" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 결제 버튼 */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-3">
                <button
                  onClick={onClearCart}
                  className="flex-1 py-3 border-2 rounded-xl font-semibold text-gray-500 text-sm"
                >
                  전체 삭제
                </button>
                <button
                  onClick={onCheckout}
                  disabled={cart.length === 0}
                  className="flex-[2] py-3 bg-pink-500 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 disabled:bg-gray-300"
                >
                  <span className="text-sm font-medium text-pink-100 font-semibold">
                    총 결제금액
                  </span>
                  <span className="text-lg font-extrabold">
                    {cart
                      .reduce((sum, item) => sum + item.price * item.quantity, 0)
                      .toLocaleString()}
                    원 결제하기
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
