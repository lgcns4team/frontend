import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentMethodPage from '../components/PaymentMethodPage';
import PaymentProgressModal from '../components/PaymentProgressModal';
import { useCartStore } from '../store/UseCartStore';

type PaymentStep = 'initial' | 'method' | 'processing';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCartStore();
  const [step, setStep] = useState<PaymentStep>('initial');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'voucher' | 'nfc' | null>(null);

  // 초기 step 설정 (state가 있으면 'method'로, 없으면 'initial'로)
  useEffect(() => {
    const state = location.state as { directToMethod?: boolean } | null;
    if (state?.directToMethod) {
      setStep('method');
    }
  }, [location.state]);

  const handlePaymentComplete = () => {
    setPaymentMethod(null);
    setStep('initial');
    clearCart();
    navigate('/order');
  };

  const handleSelectMethod = (method: 'card' | 'mobile' | 'voucher'| 'nfc') => {
    setPaymentMethod(method);
    setStep('processing');
  };

  return (
    <>
      {/* 90도 회전 래퍼 */}
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
        <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl">
          {/* 1. 헤더 */}
          <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
            <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
            <button
              onClick={() => navigate('/order')}
              className="text-base text-gray-400 underline hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <span className="text-3xl">🏠</span> <span className="font-bold">주문으로</span>
            </button>
          </header>

          {/* 2. 메인 콘텐츠 */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* 초기 결제 화면 */}
            {step === 'initial' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-12 p-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">결제</h1>
                  <p className="text-3xl font-semibold text-orange-600">총액: 000원</p>
                </div>

                <button
                  onClick={() => setStep('method')}
                  className="bg-orange-500 hover:bg-orange-600 transition-colors text-white px-12 py-6 rounded-xl text-2xl font-bold"
                >
                  결제하기
                </button>
              </div>
            )}

            {/* 결제 수단 선택 화면 */}
            {step === 'method' && <PaymentMethodPage onSelectMethod={handleSelectMethod} />}
          </main>
        </div>
      </div>

      {/* 결제 진행 모달 */}
      {step === 'processing' && paymentMethod && (
        <PaymentProgressModal paymentMethod={paymentMethod} onClose={handlePaymentComplete} />
      )}
    </>
  );
}
