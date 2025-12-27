// src/pages/EasyPayment.tsx
import { useEffect } from 'react';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/UseCartStore';
import EasyPaymentProgressModal from '../components/EasyPaymentProgressModal';

export default function EasyPayment() {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  //  결제 완료 → 광고 화면으로 이동 (너네 광고 라우트로 바꾸면 됨)
  const handleComplete = (orderNumber: number) => {
    clearCart();
    navigate('/ad', { state: { orderNumber } });
  };

  // (선택) 들어오자마자 다른 행동이 필요하면 여기 useEffect에 추가
  useEffect(() => {
    // noop
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
        <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl">
          <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
            <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
            <button
              onClick={() => navigate('/easy')}
              className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-8 h-8" /> <span className="font-semibold text-xl">주문으로</span>
            </button>
          </header>

          {/* 여기엔 굳이 내용 없어도 됨. (배경/레이아웃만 유지) */}
          <main className="flex-1 flex flex-col overflow-hidden" />
        </div>
      </div>

      {/*  들어오자마자 카드 결제 진행 화면 */}
      <EasyPaymentProgressModal onComplete={handleComplete} />
    </>
  );
}
