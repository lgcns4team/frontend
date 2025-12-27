import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentMethodPage from '../components/PaymentMethodPage';
import PaymentProgressModal from '../components/PaymentProgressModal';
import { useCartStore } from '../store/UseCartStore';
import { createOrder } from '../api/OrderApi'; 
import type { OrderItemRequest } from '../types/OrderTypes';

type PaymentStep = 'initial' | 'method' | 'processing';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getTotalPrice, clearCart } = useCartStore();
  
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [step, setStep] = useState<PaymentStep>('initial');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'voucher' | 'nfc' | null>(null);

  // [디자인/로직] 페이지 진입 시 결제 수단 선택 화면으로 바로 이동
  useEffect(() => {
    setStep('method');
  }, [location.state]);

  // DB 값 매핑 (결제수단)
  const getMappedPaymentMethod = (method: string | null): string => {
    switch (method) {
      case 'card': return '카드결제';
      case 'mobile': return '네이버페이';
      case 'voucher': return '쿠폰결제';
      case 'nfc': return 'NFC결제';
      default: return '카드결제';
    }
  };

  // DB 값 매핑 (주문타입)
  const getMappedOrderType = (method: string): string => {
    return method === 'takeout' ? 'takeout' : 'dine-in';
  };

  const processOrder = async () => {
    if (cart.length === 0) {
      alert("장바구니가 비어있습니다.");
      navigate('/order');
      return;
    }

    setIsApiLoading(true);

    try {
      // 1. 주문 아이템 데이터 변환
      const orderItems: OrderItemRequest[] = cart.map((item) => ({
        menuId: item.id,
        quantity: item.quantity,
        selectedOptions: item.selectedBackendOptions.map((opt) => ({
          optionItemId: opt.optionItemId,
          quantity: opt.quantity,
        })),
      }));

      const currentOrderMethod = location.state?.orderMethod || 'dine-in';

      // 2. 요청 데이터 생성 (DB 구조에 맞춰 any 타입 사용)
      const requestData: any = {
        storeId: 1,
        sessionId: 1, // [필수] 세션 ID
        
        orderType: getMappedOrderType(currentOrderMethod),
        paymentMethod: getMappedPaymentMethod(paymentMethod),
        pgTransactionId: "PG_TEST_" + Date.now(),
        totalAmount: getTotalPrice(),
        
        orderItems: orderItems,
      };

      console.log("🚀 결제 요청:", requestData);
      
      // 3. 주문 생성 API 호출
      await createOrder(requestData);
      
      // 4. 성공 처리 및 홈으로 이동
      clearCart();
      setPaymentMethod(null);
      setStep('initial');
      
      // 사용자 피드백 후 홈으로
      alert("주문이 정상적으로 완료되었습니다!");
      navigate('/'); // [핵심] 홈 화면으로 이동

    } catch (error) {
      console.error("주문 실패:", error);
      alert("주문 처리에 실패했습니다.\n(관리자에게 문의해주세요)");
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
      {/* 90도 회전된 키오스크 전체 레이아웃 (원본 디자인 유지) */}
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