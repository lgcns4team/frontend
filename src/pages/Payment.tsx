import { useState, useEffect, useRef } from 'react';
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
  
  // [신규] 중복 요청 방지용 Ref (새로고침 전까지 유지됨)
  const isProcessingRef = useRef(false);
  
  const [step, setStep] = useState<PaymentStep>('initial');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'voucher' | 'nfc' | null>(null);

  useEffect(() => {
    setStep('method');
  }, [location.state]);

  const getMappedPaymentMethod = (method: string | null): string => {
    switch (method) {
      case 'card': return '카드결제';
      case 'mobile': return '네이버페이';
      case 'voucher': return '쿠폰결제';
      case 'nfc': return 'NFC결제';
      default: return '카드결제';
    }
  };

  const getMappedOrderType = (method: string): string => {
    return method === 'takeout' ? 'takeout' : 'dine-in';
  };

  const processOrder = async () => {
    // [중복 방지] 이미 처리 중이면 함수 종료 (로그 두 번 찍힘 방지)
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const orderItems: OrderItemRequest[] = cart.map((item) => ({
        menuId: item.id,
        quantity: item.quantity,
        selectedOptions: item.selectedBackendOptions.map((opt) => ({
          optionItemId: opt.optionItemId,
          quantity: opt.quantity,
        })),
      }));

      const currentOrderMethod = location.state?.orderMethod || 'dine-in';

      // 500 에러 방지를 위한 데이터 조립
      const requestData: any = {
        storeId: 1,      
        sessionId: 1,    
        
        orderType: getMappedOrderType(currentOrderMethod),
        paymentMethod: getMappedPaymentMethod(paymentMethod),
        
        pgTransactionId: "PG_TEST_" + Date.now(),
        totalAmount: getTotalPrice(),
        
        orderItems: orderItems,
      };

      console.log("🚀 결제 요청 데이터:", requestData);
      
      await createOrder(requestData);
      
      clearCart();
      setPaymentMethod(null);
      setStep('initial');
      
      navigate('/'); 

    } catch (error) {
      console.error("주문 실패:", error);
      alert("주문 접수 중 오류가 발생했습니다.");
      navigate('/');
    } finally {
      // (선택) 실패하거나 완료 후에도 Lock을 풀지 않고 홈으로 이동시킴
      // 만약 페이지에 머무른다면 isProcessingRef.current = false; 가 필요함
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
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
        <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl">
          
          <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
            <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
            <button
              onClick={() => navigate('/order')}
              className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
             <Home className="w-8 h-8" /> <span className="font-semibold text-xl">주문으로</span>
            </button>
          </header>

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
    </>
  );
}