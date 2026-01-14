import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PaymentMethodPage from '../components/PayMent/PaymentMethodPage';
import PaymentProgressModal from '../components/PayMent/PaymentProgressModal';
import { useCartStore } from '../store/UseCartStore';
import { createOrder, verifyOrder } from '../api/OrderApi';
// [수정] 새로 만든 타입들을 불러옵니다.
import type {
  OrderItemRequest,
  CreateOrderRequest,
  OrderVerificationResponse,
} from '../types/OrderTypes';

// 기준 화면 크기 (9:16 비율)
const BASE_WIDTH = 900;
const BASE_HEIGHT = 1600;

type PaymentStep = 'initial' | 'method' | 'processing';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getTotalPrice, clearCart } = useCartStore();

  const [scale, setScale] = useState<number | null>(null);

  // 중복 요청 방지용 Ref
  const isProcessingRef = useRef(false);

  const [step, setStep] = useState<PaymentStep>('initial');
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'kakaopay' | 'naverpay' | 'samsungpay' | 'applepay' | 'gifticon' | null
  >(null);

  // 🎯 반응형 스케일 계산
  useLayoutEffect(() => {
    const calculateScale = () => {
      const scaleX = window.innerWidth / BASE_WIDTH;
      const scaleY = window.innerHeight / BASE_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);




  useEffect(() => {
    const skip = (location.state as any)?.skipMethod;
    const forcedMethod = (location.state as any)?.paymentMethod as
      | 'card'
      | 'kakaopay'
      | 'naverpay'
      | 'samsungpay'
      | 'applepay'
      | 'gifticon'
      | undefined;

    if (skip) {
      //  결제수단 선택 생략 → 바로 카드 삽입 화면(processing)
      setPaymentMethod(forcedMethod ?? 'card');
      setStep('processing');
      return;
    }

    // 기존 플로우 유지
    setStep('method');
  }, [location.state]);

  const getMappedPaymentMethod = (method: string | null): string => {
    switch (method) {
      case 'card':
        return '카드결제';
      case 'kakaopay':
        return '카카오페이';
      case 'naverpay':
        return '네이버페이';
      case 'samsungpay':
        return '삼성페이';
      case 'applepay':
        return '애플페이';
      case 'gifticon':
        return '기프티콘';
      default:
        return '카드결제';
    }
  };

  const getMappedOrderType = (method: string): string => {
    return method === 'takeout' ? 'takeout' : 'dine-in';
  };

  const processOrder = async () => {
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
      const currentTotalAmount = getTotalPrice();

      // [수정] any를 지우고 정식 타입(CreateOrderRequest) 적용!
      const requestData: CreateOrderRequest = {
        storeId: 1,
        sessionId: 1,

        orderType: getMappedOrderType(currentOrderMethod),
        paymentMethod: getMappedPaymentMethod(paymentMethod),
        pgTransactionId: 'PG_TEST_' + Date.now(),

        // 백엔드 요구사항: 두 필드 모두 전송
        totalAmount: currentTotalAmount,
        expectedTotalAmount: currentTotalAmount,

        orderItems: orderItems,

        // 선택 사항은 생략 가능
      };

      console.log('🔍 주문 검증 요청:', requestData);

      // 1. 주문 검증 API 호출
      // [수정] 응답 변수에도 정식 타입(OrderVerificationResponse) 적용
      // (OrderApi.ts의 verifyOrder 함수가 any가 아닌 이 타입을 반환하도록 되어 있어야 함.
      //  만약 에러나면 일단 'as unknown as OrderVerificationResponse'로 형변환 가능)
      const verification = (await verifyOrder(requestData)) as unknown as OrderVerificationResponse;

      console.log('📨 백엔드 검증 응답:', verification);

      const backendCalculated = verification.calculatedTotalAmount;
      const isValid = verification.isValid;

      // 검증 실패 체크
      if (isValid === false) {
        console.error(`❌ 검증 실패: ${verification.errorMessage || '이유 미상'}`);
        console.error(`금액 비교: 프론트(${currentTotalAmount}) vs 백엔드(${backendCalculated})`);

        alert('장바구니 금액 정보가 일치하지 않습니다. 초기화합니다.');
        clearCart();
        navigate('/order');
        return;
      }

      // 이중 체크
      if (
        backendCalculated !== undefined &&
        backendCalculated !== null &&
        backendCalculated !== currentTotalAmount
      ) {
        console.error(`❌ 금액 수치 불일치!`);
        alert('금액이 변경되었습니다. 다시 주문해주세요.');
        clearCart();
        navigate('/order');
        return;
      }

      console.log('✅ 검증 완료! 결제 진행');

      // 2. 주문 생성 API 호출
      await createOrder(requestData);

      clearCart();
      setPaymentMethod(null);
      setStep('initial');

      navigate('/');
    } catch (error) {
      console.error('주문 처리 실패:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
      navigate('/');
    } finally {
      // isProcessingRef.current = false;
    }
  };

  const handlePaymentComplete = () => {
    processOrder();
  };

  const handleSelectMethod = (
    method: 'card' | 'kakaopay' | 'naverpay' | 'samsungpay' | 'applepay' | 'gifticon'
  ) => {
    setPaymentMethod(method);
    setStep('processing');
  };

  if (scale === null) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50"
      >
        <div
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className="origin-center bg-gray-50 flex flex-col shadow-2xl"
        >
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
          {step === 'processing' && paymentMethod && (
            <PaymentProgressModal paymentMethod={paymentMethod} onClose={handlePaymentComplete} />
          )}
        </div>
      </motion.div>
    </>
  );
}
