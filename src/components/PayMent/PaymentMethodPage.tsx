interface PaymentMethodPageProps {
  onSelectMethod: (method: 'card' | 'kakaopay' | 'naverpay' | 'samsungpay' | 'applepay' | 'gifticon') => void;
}

import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  type: 'card' | 'kakaopay' | 'naverpay' | 'samsungpay' | 'applepay' | 'gifticon';
}

export default function PaymentMethodPage({ onSelectMethod }: PaymentMethodPageProps) {
  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: '카드결제', icon: '💳', type: 'card' },
    { id: 'kakao', name: '카카오페이', image: '/raw/kakao-pay.png', type: 'kakaopay' },
    { id: 'naver', name: '네이버페이', image: '/raw/naver-pay.png', type: 'naverpay' },
    { id: 'samsung', name: '삼성페이', image: '/raw/samsung-pay.png', type: 'samsungpay' },
    { id: 'apple', name: '애플페이', image: '/raw/apple-pay.png', type: 'applepay' },
    { id: 'gift', name: '기프티콘', icon: '🎁', type: 'gifticon' },
  ];

  return (
    <div className="h-full flex flex-col items-center p-4 overflow-y-auto">
      <h2 className="text-4xl font-semibold text-center pt-12 mb-2">결제 수단을 선택해주세요</h2>

      <div className="flex flex-1 items-start justify-center w-full pt-10">
        {/* 위치 조절은 여기 translate-y 값만 수정하면 됩니다. */}
        <div className="w-full max-w-2xl relative translate-y-[150px]">
          <div className="grid grid-cols-2 gap-5 w-full">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                onClick={() => onSelectMethod(method.type)}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-2 border-pink-200 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center min-h-52 select-none"
              >
                <div className="w-28 h-28 flex items-center justify-center">
                  {method.image ? (
                    <img
                      src={method.image}
                      alt={method.name}
                      draggable={false}
                      className={
                        method.id === 'naver'
                          ? 'block w-full h-full object-contain shrink-0 scale-110'
                          : method.id === 'kakao'
                          ? 'block w-full h-full object-contain shrink-0 scale-90'
                          : 'block w-full h-full object-contain shrink-0'
                      }
                    />
                  ) : (
                    <span
                      className={
                        method.id === 'card'
                          ? 'block text-[100px] leading-none -translate-y-2 select-none'
                          : method.id === 'gift'
                          ? 'block text-[72px] leading-none select-none'
                          : 'block text-[72px] leading-none select-none'
                      }
                    >
                      {method.icon}
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xl font-semibold text-gray-800 text-center leading-tight">
                  {method.name}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
