import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentMethodPage from '../components/PaymentMethodPage';
import PaymentProgressModal from '../components/PaymentProgressModal';
import { useCartStore } from '../store/UseCartStore';
import { createOrder } from '../api/OrderApi';
import type { CreateOrderRequest, OrderItemRequest } from '../types/OrderTypes';

type PaymentStep = 'initial' | 'method' | 'processing';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getTotalPrice, clearCart } = useCartStore();

  const [isApiLoading, setIsApiLoading] = useState(false);
  const [step, setStep] = useState<PaymentStep>('initial');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'voucher' | 'nfc' | null>(
    null
  );

  useEffect(() => {
    setStep('method');
  }, [location.state]);

  // 주문 처리 로직
  const processOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.');
      navigate('/order');
      return;
    }

    setIsApiLoading(true);

    try {
      // 장바구니 데이터를 서버 포맷으로 변환
      const orderItems: OrderItemRequest[] = cart.map((item) => ({
        menuId: item.id,
        quantity: item.quantity,
        selectedOptions: item.selectedBackendOptions.map((opt) => ({
          optionItemId: opt.optionItemId,
          quantity: opt.quantity,
        })),
      }));

      const requestData: CreateOrderRequest = {
        storeId: 1,
        paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : 'CARD',
        pgTransactionId: 'PG_TEST_' + Date.now(),
        totalAmount: getTotalPrice(),
        orderItems: orderItems,
      };

      // NOTE: (나중에 사용) 백엔드에 주문 검증 엔드포인트가 준비되면 아래 로직을 복구해서 사용하세요.
      // const verification = await verifyOrder(requestData);
      // if (verification.totalAmount !== requestData.totalAmount) {
      //   alert("장바구니 금액 정보가 변경되었습니다. 장바구니를 갱신합니다.");
      //   clearCart();
      //   navigate('/order');
      //   return;
      // }

      await createOrder(requestData);

      clearCart();
      setPaymentMethod(null);
      setStep('initial');
      alert('주문이 정상적으로 완료되었습니다!');
      navigate('/advertisement');
    } catch (error) {
      console.error('주문 실패:', error);
      alert('주문 처리에 실패했습니다.');
    } finally {
      setIsApiLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    processOrder();
  };

  const handleSelectMethod = (method: 'card' | 'mobile' | 'voucher' | 'nfc') => {
    setPaymentMethod(method);
    setStep('processing');
  };

  return (
    <>
      {/* [디자인 복구] 90도 회전된 키오스크 전체 레이아웃 */}
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
        <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl">
          {/* 헤더 */}
          <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
            <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
            <button
              onClick={() => navigate('/order')}
              className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-8 h-8" /> <span className="font-semibold text-xl">주문으로</span>
            </button>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {step === 'initial' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-12 p-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">결제</h1>
                  <p className="text-3xl font-semibold text-orange-600">
                    총액: <span className="text-4xl">{getTotalPrice().toLocaleString()}</span>원
                  </p>
                </div>

                <button
                  onClick={() => setStep('method')}
                  className="bg-orange-500 hover:bg-orange-600 transition-colors text-white px-12 py-6 rounded-xl text-2xl font-bold shadow-lg animate-bounce"
                >
                  결제하기
                </button>
              </div>
            )}

            {step === 'method' && <PaymentMethodPage onSelectMethod={handleSelectMethod} />}
          </main>
        </div>
      </div>

      {step === 'processing' && paymentMethod && (
        <PaymentProgressModal paymentMethod={paymentMethod} onClose={handlePaymentComplete} />
      )}

      {isApiLoading && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <div className="text-white text-2xl font-bold animate-pulse">주문 생성 중...</div>
        </div>
      )}
    </>
  );
}
