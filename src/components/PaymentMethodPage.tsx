interface PaymentMethodPageProps {
  onSelectMethod: (method: 'card' | 'mobile' | 'voucher' | 'nfc') => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  type: 'card' | 'mobile' | 'voucher' | 'nfc';
}

export default function PaymentMethodPage({ onSelectMethod }: PaymentMethodPageProps) {
  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: '카드결제', icon: '💳', type: 'card' },
    { id: 'kakao', name: '카카오페이', image: '/raw/kakao-pay.png', type: 'mobile' },
    { id: 'naver', name: '네이버페이', image: '/raw/naver-pay.png', type: 'mobile' },
    { id: 'samsung', name: '삼성페이', image: '/raw/samsung-pay.png', type: 'nfc' },
    { id: 'apple', name: '애플페이', image: '/raw/apple-pay.png', type: 'nfc' },
    { id: 'gift', name: '기프티콘', icon: '🎁', type: 'voucher' },
  ];

  return (
    <div className="h-full flex flex-col items-center p-4 overflow-y-auto">
      <h2 className="text-3xl font-semibold text-center pt-16 mb-2">결제 수단을 선택해주세요</h2>

      <div className="flex flex-1 items-center justify-center w-full">
        <div className="grid grid-cols-2 gap-5 w-full max-w-2xl">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.type)}
              className="bg-pink-200 hover:bg-pink-300 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-52"
            >
              {method.image ? (
                <img src={method.image} alt={method.name} className="w-20 h-20 object-contain" />
              ) : (
                <span className="text-6xl">{method.icon}</span>
              )}
              <div className="text-xl font-semibold text-gray-800 text-center">{method.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
