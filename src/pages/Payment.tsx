import { useState, useEffect } from 'react';
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'voucher' | 'nfc' | null>(null);

  useEffect(() => {
    const state = location.state as { directToMethod?: boolean } | null;
    if (state?.directToMethod) {
      setStep('method');
    }
  }, [location.state]);

  // 주문 처리 로직
  const processOrder = async () => {
    if (cart.length === 0) {
      alert("장바구니가 비어있습니다.");
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
        paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : "CARD",
        pgTransactionId: "PG_TEST_" + Date.now(),
        totalAmount: getTotalPrice(),
        orderItems: orderItems,
      };

      console.log("🔍 주문 검증 요청 중...");
      const verification = await verifyOrder(requestData);

      if (verification.totalAmount !== requestData.totalAmount) {
      console.error(`금액 불일치! 프론트(${requestData.totalAmount}) vs 백엔드(${verification.totalAmount})`);
      alert("장바구니 금액 정보가 변경되었습니다. 장바구니를 갱신합니다.");
      
      // (선택) 여기서 장바구니를 비우거나, 백엔드 금액으로 강제 업데이트 하는 로직 추가 가능
      // clearCart(); 
      // navigate('/order');
      return; // 결제 중단
    }

    console.log("✅ 검증 완료! 결제 진행");

      await createOrder(requestData);
      
      clearCart();
      setPaymentMethod(null);
      setStep('initial');
      alert("주문이 정상적으로 완료되었습니다!");
      navigate('/'); 

    } catch (error) {
      console.error("주문 실패:", error);
      alert("주문 처리에 실패했습니다.");
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
              className="text-base text-gray-400 underline hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <span className="text-3xl">🏠</span> <span className="font-bold">주문으로</span>
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

            {step === 'method' && (
              <PaymentMethodPage onSelectMethod={handleSelectMethod} />
            )}
          </main>
        </div>
      </div>

      {step === 'processing' && paymentMethod && (
        <PaymentProgressModal 
          paymentMethod={paymentMethod} 
          onClose={handlePaymentComplete} 
        />
      )}
      
      {isApiLoading && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <div className="text-white text-2xl font-bold animate-pulse">
            주문 생성 중...
          </div>
        </div>
      )}
    </>
  );
}