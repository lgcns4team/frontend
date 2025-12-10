import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ShoppingCart, CreditCard } from "lucide-react";
import type { CartItemData } from "../types/VoiceOrderTypes"; // 음성 전용 타입

interface Props {
  cart: CartItemData[];
  totalAmount: number;
  onCheckout: () => void;
  onClear: () => void;
  onUpdateQuantity: (id: string, delta: number) => void; // 수량 변경 함수 필요 시 구현
}

export default function VoiceBottomCart({ cart, totalAmount, onCheckout, onClear, onUpdateQuantity }: Props) {
  
  // 옵션 렌더링 헬퍼 (음성 주문은 string[] 형태이므로 단순 join)
  const renderOptions = (options?: string[]) => {
    if (!options || options.length === 0) return null;
    return options.join(" / ");
  };

  return (
    // [UI 동일] 높이 h-[420px], 그림자, 테두리 등 BottomCart와 완벽히 동일
    <div className="bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-30 flex flex-col h-[420px] shrink-0">
      
      {/* 1. 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2 text-gray-700">
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold text-lg">음성 주문 내역</span>
          {cart.length > 0 && (
            <span className="bg-blue-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-400 underline hover:text-red-500 font-medium"
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* 2. 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-white">
        <AnimatePresence>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
              <span className="text-6xl">🛒</span>
              <span className="text-sm">장바구니에 메뉴가 없습니다</span>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item._uid} // VoiceOrder는 _uid 사용
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-sm">
                    {item.name}
                  </span>
                  {/* 음성 옵션 표시 */}
                  {item.options && item.options.length > 0 && (
                    <span className="text-gray-400 text-xs mt-0.5">
                      {renderOptions(item.options)}
                    </span>
                  )}
                  <span className="text-gray-500 text-xs mt-1">
                    {(item.price).toLocaleString()}원
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm">
                  {/* 수량 조절 기능은 Voice 로직에 맞춰 연결 */}
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)} 
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 3. 결제 버튼 영역 */}
      <div className="p-5 bg-white border-t border-gray-100 flex gap-4 h-[140px] shrink-0">
        <div className="flex-1 bg-gray-900 text-white rounded-3xl flex flex-col justify-center px-8 shadow-lg">
          <span className="text-gray-400 text-lg font-medium mb-1">
            총 결제금액
          </span>
          <span className="text-4xl font-extrabold tracking-tight">
            {totalAmount.toLocaleString()}
            <span className="text-2xl ml-1 font-bold text-gray-400">
              원
            </span>
          </span>
        </div>

        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-[40%] rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl ${
            cart.length > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transform hover:scale-105 active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <CreditCard className="w-10 h-10 mb-1" />
          <span className="text-3xl font-extrabold leading-none">
            결제하기
          </span>
        </button>
      </div>
    </div>
  );
}





