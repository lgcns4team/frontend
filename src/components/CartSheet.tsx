import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/UseCartStore';
import type { CartItem } from '../types/OrderTypes';

interface CartSheetProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
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
  const { getTotalPrice } = useCartStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // [수정 핵심] 개별 메뉴 가격 계산 (옵션 수량 반영)
  const getItemTotalPrice = (item: CartItem) => {
    const optionsPrice = item.selectedBackendOptions 
      ? item.selectedBackendOptions.reduce(
          (acc, opt) => acc + (opt.price * opt.quantity), // 여기서 곱셈 추가!
          0
        )
      : 0;

    return (item.price + optionsPrice) * item.quantity;
  };

  const renderOptionText = (item: CartItem) => {
    if (item.selectedBackendOptions && item.selectedBackendOptions.length > 0) {
       return item.selectedBackendOptions.map(o => o.name).join(', ');
    }
    if (item.options) {
      const parts: string[] = [];
      if (item.options.temperature) parts.push(item.options.temperature === 'hot' ? 'HOT' : 'ICE');
      if (item.options.size) parts.push(item.options.size.toUpperCase());
      if (item.options.shot && item.options.shot > 0) parts.push(`샷 ${item.options.shot}추가`);
      if (item.options.whip) parts.push('휘핑');
      if (item.options.isWeak) parts.push('연하게');
      return parts.join(', ');
    }
    return null;
  };

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col h-[85vh]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-gray-800" />
                <span className="text-xl font-bold">주문 내역</span>
                <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {totalItems}
                </span>
              </div>
              <button onClick={onClose}>
                <X className="w-8 h-8 text-gray-400" />
              </button>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <ShoppingCart className="w-16 h-16 opacity-20" />
                  <span className="text-xl font-medium">장바구니가 비어있습니다</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                           <img 
                            src={item.img || "/images/no-image.png"} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/100?text=No+Img")}
                           />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500 mt-1 font-medium">
                            {renderOptionText(item)}
                          </p>
                        </div>
                      </div>
                      
                      <button onClick={() => onRemoveItem(item.cartId)} className="text-gray-300 hover:text-red-500 p-1">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end border-t pt-3 mt-1">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-1 border border-gray-200">
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xl font-bold text-gray-900">
                        {getItemTotalPrice(item).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 하단 결제 버튼 */}
            <div className="p-4 border-t bg-white safe-area-bottom">
              <div className="flex gap-3">
                <button
                  onClick={onClearCart}
                  className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                >
                  전체 삭제
                </button>
                <button
                  onClick={onCheckout}
                  disabled={cart.length === 0}
                  className="flex-[2] py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 disabled:bg-gray-300 transition-colors shadow-lg shadow-orange-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-100 text-sm font-medium">총 결제금액</span>
                    <span className="text-xl font-extrabold">
                      {getTotalPrice().toLocaleString()}원
                    </span>
                  </div>
                  <span className="text-sm opacity-90">결제하기</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}