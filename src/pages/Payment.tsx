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
  
  // API 처리 중 중복 호출 방지
  const [isApiLoading, setIsApiLoading] = useState(false);
  
  const [step, setStep] = useState<PaymentStep>('initial');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'voucher' | 'nfc' | null>(null);

  // 초기 step 설정
  useEffect(() => {
    const state = location.state as { directToMethod?: boolean } | null;
    if (state?.directToMethod) {
      setStep('method');
    }
  }, [location.state]);

  // [핵심 로직] 실제 주문 생성 및 서버 전송 함수
  const processOrder = async () => {
    if (cart.length === 0) {
      alert("장바구니가 비어있습니다.");
      navigate('/order');
      return;
    }

    setIsApiLoading(true);

    try {
      // 1. [데이터 변환] 장바구니(Frontend) -> 주문요청(Backend)
      const orderItems: OrderItemRequest[] = cart.map((item) => ({
        menuId: item.id,       // 메뉴 ID
        quantity: item.quantity, // 메뉴 수량
        
        // ★ store/UseCartStore.ts에 저장해둔 selectedBackendOptions를 사용
        selectedOptions: item.selectedBackendOptions.map((opt) => ({
          optionItemId: opt.optionItemId, // 백엔드용 옵션 ID
          quantity: opt.quantity,         // 옵션 수량
        })),
      }));

      // 2. 최종 요청 데이터 생성
      const requestData: CreateOrderRequest = {
        storeId: 1,              // 가게 ID (고정값)
        //sessionId: Math.floor(Math.random() * 100000), // 임의 세션 ID
        
        // 결제 수단 매핑 (card -> CARD)
        paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : "CARD", 
        
        pgTransactionId: "PG_TEST_" + Date.now(), // 테스트용 결제 ID
        totalAmount: getTotalPrice(), // 총 결제 금액
        orderItems: orderItems,       // 변환된 메뉴 리스트
      };
      console.log("🚀 [최종 전송 데이터]:", JSON.stringify(requestData, null, 2));

      console.log("🚀 서버로 전송하는 주문 데이터:", JSON.stringify(requestData, null, 2));

      // 3. API 호출
      const response = await createOrder(requestData);
      
      console.log("✅ 주문 성공:", response);
      // alert(`주문이 완료되었습니다! (주문번호: ${response.orderNo})`);
      
      // 4. 성공 처리 (장바구니 비우기 및 메인 이동)
      clearCart();
      setPaymentMethod(null);
      setStep('initial');
      navigate('/'); // 또는 주문 완료 페이지 ('/complete')로 이동

    } catch (error) {
      console.error("❌ 주문 실패:", error);
      alert("결제 승인은 되었으나 주문 생성에 실패했습니다. 직원에게 문의해주세요.");
      // 에러 발생 시에도 일단 메인으로 가거나, 다시 시도하게 할 수 있음
      navigate('/');
    } finally {
      setIsApiLoading(false);
    }
  };

  // 모달이 닫히거나(결제 프로세스 완료 시) 호출되는 함수
  const handlePaymentComplete = () => {
    // 결제 모달(PaymentProgressModal)이 "완료"되었다고 닫힐 때
    // 실제로 서버에 주문을 넣습니다.
    processOrder();
  };

  const handleSelectMethod = (method: 'card' | 'mobile' | 'voucher' | 'nfc') => {
    setPaymentMethod(method);
    setStep('processing'); // -> 모달 오픈
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
                  {/* 총액 표시 부분 수정 (000원 -> 실제 가격) */}
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

            {/* 결제 수단 선택 화면 */}
            {step === 'method' && (
              <PaymentMethodPage onSelectMethod={handleSelectMethod} />
            )}
          </main>
        </div>
      </div>

      {/* 결제 진행 모달 (여기서 결제 시늉을 하고 닫힐 때 API 호출) */}
      {step === 'processing' && paymentMethod && (
        <PaymentProgressModal 
          paymentMethod={paymentMethod} 
          onClose={handlePaymentComplete} // 모달 종료 시 -> processOrder 실행
        />
      )}
      
      {/* (선택) API 로딩 중일 때 전체 화면 막기 */}
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