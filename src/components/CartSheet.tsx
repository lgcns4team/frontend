import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import type { CartItem } from "../types/index";

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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col h-[70vh]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-gray-800" />
                <span className="text-xl font-bold">주문 내역</span>
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{totalItems}</span>
              </div>
              <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 opacity-20 mb-2"/>
                  <span>비어있음</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-sm text-gray-400">
                        {item.options?.temperature === 'hot' ? 'HOT' : 'ICE'} / {item.options?.size}
                      </p>
                      <p className="text-orange-600 font-bold">{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => onUpdateQuantity(item.cartId, -1)} className="p-1 bg-gray-100 rounded"><Minus className="w-4 h-4"/></button>
                      <span className="font-bold">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.cartId, 1)} className="p-1 bg-gray-100 rounded"><Plus className="w-4 h-4"/></button>
                      <button onClick={() => onRemoveItem(item.cartId)} className="ml-2 text-red-400"><X className="w-5 h-5"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 결제 버튼 */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                 <button onClick={onClearCart} className="flex-1 py-4 border-2 rounded-xl font-bold text-gray-500">전체삭제</button>
                 <button onClick={onCheckout} disabled={cart.length === 0} className="flex-[2] py-4 bg-pink-500 text-white rounded-xl font-bold text-xl disabled:bg-gray-300">결제하기</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}