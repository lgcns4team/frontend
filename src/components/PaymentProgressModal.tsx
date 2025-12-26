import { useEffect, useState } from 'react';
import InsertCardAnimation from './InsertCardAnimation';
import QrScanAnimation from './QrScanAnimation';
import BarcodeScanAnimation from './BarcodeScanAnimation';
import NfcPayAnimation from './NfcPayAnimation';
import { getRandomAd } from '../config/ads';

interface PaymentProgressModalProps {
  paymentMethod: 'card' | 'mobile' | 'voucher' | 'nfc';
  onClose: () => void;
}

// 오늘 날짜 기반 주문 번호 관리
const getOrderNumber = (): number => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
  const storedData = localStorage.getItem('orderData');

  if (storedData) {
    const { date, orderNumber } = JSON.parse(storedData);

    // 날짜가 같으면 주문 번호 +1, 다르면 1로 초기화
    if (date === today) {
      const nextNumber = orderNumber + 1;
      localStorage.setItem('orderData', JSON.stringify({ date: today, orderNumber: nextNumber }));
      return nextNumber;
    } else {
      // 새로운 날짜이면 1로 초기화
      localStorage.setItem('orderData', JSON.stringify({ date: today, orderNumber: 1 }));
      return 1;
    }
  } else {
    // 처음이면 1로 시작
    localStorage.setItem('orderData', JSON.stringify({ date: today, orderNumber: 1 }));
    return 1;
  }
};

export default function PaymentProgressModal({
  paymentMethod,
  onClose,
}: PaymentProgressModalProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [adImage, setAdImage] = useState<string>('');

  useEffect(() => {
    // 5초 후 결제 완료
    const processingTimer = setTimeout(() => {
      setIsProcessing(false);
    }, 5000);

    return () => clearTimeout(processingTimer);
  }, []);

  // 완료 상태가 되었을 때 주문 번호 생성
  useEffect(() => {
    if (!isProcessing) {
      setOrderNumber(getOrderNumber());
      setAdImage(getRandomAd().image);
    }
  }, [isProcessing]);

  // 완료 후 5초 카운트다운
  useEffect(() => {
    if (!isProcessing) {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [isProcessing, onClose]);

  // countdown이 0이 되면 모달을 닫습니다.
  // (주의) setState updater 내부에서 onClose()를 호출하면
  // React가 렌더 중 updater를 실행할 때 "Cannot update a component while rendering" 경고가 날 수 있습니다.
  useEffect(() => {
    if (isProcessing) return;
    if (countdown !== 0) return;
    onClose();
  }, [countdown, isProcessing, onClose]);

  const getContent = () => {
    if (paymentMethod === 'card') {
      return {
        title: '신용카드 결제',
        processingMessage: '카드를 인식 중입니다...',
        completeMessage: '결제가 완료되었습니다!',
        useAnimation: true,
      };
    } else if (paymentMethod === 'voucher') {
      return {
        title: '기프티콘 결제',
        instruction: '바코드를 스캔해주세요',
        processingMessage: '기프티콘을 확인 중입니다...',
        completeMessage: '결제가 완료되었습니다!',
        useAnimation: false,
        animationType: 'voucher',
      };
    } else if (paymentMethod === 'nfc') {
      return {
        title: '휴대폰 결제',
        instruction: '리더기에 휴대폰을 대주세요',
        processingMessage: '결제를 진행 중입니다...',
        completeMessage: '결제가 완료되었습니다!',
        useAnimation: false,
        animationType: 'nfc',
      };
    } else {
      return {
        title: '모바일 결제',
        instruction: '카메라로 QR 코드를 스캔해주세요',
        processingMessage: '결제를 진행 중입니다...',
        completeMessage: '결제가 완료되었습니다!',
        useAnimation: false,
        animationType: 'qr',
      };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-transparent flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-12 w-[95%] h-[90%] shadow-2xl text-center flex flex-col items-center justify-center overflow-hidden">
          <h2 className="text-4xl font-bold mb-12">{content.title}</h2>

          {isProcessing ? (
            <>
              {/* 애니메이션 또는 아이콘 */}
              {(content as any).useAnimation ? (
                <div className="h-[22rem] mb-8">
                  <InsertCardAnimation />
                </div>
              ) : (content as any).animationType === 'qr' ? (
                <div className="mb-8">
                  <QrScanAnimation size={380} loop={true} />
                </div>
              ) : (content as any).animationType === 'voucher' ? (
                <div className="mb-8">
                  <BarcodeScanAnimation size={380} loop={true} />
                </div>
              ) : (content as any).animationType === 'nfc' ? (
                <div className="mb-8">
                  <NfcPayAnimation size={420} loop={true} />
                </div>
              ) : (
                <div className="text-8xl mb-6">{(content as any).icon}</div>
              )}

              <div className="flex justify-center mb-8">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              </div>

              {(content as any).instruction && (
                <p className="text-xl font-semibold text-gray-700 mb-8">
                  {(content as any).instruction}
                </p>
              )}

              <p className="text-md text-gray-500">{content.processingMessage}</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-600 mb-6">{content.completeMessage}</p>
              <div className="bg-pink-100 rounded-2xl p-8 mb-8">
                <p className="text-gray-700 mb-4 text-lg">주문 번호</p>
                <p className="text-4xl font-bold text-gray-800 mb-6">{orderNumber}</p>
                <p className="text-gray-600 text-lg">{countdown}초 후 주문화면으로 돌아갑니다</p>
              </div>
              {adImage && (
                <div className="w-full max-w-lg mx-auto mb-8">
                  <img
                    src={adImage}
                    alt="advertisement"
                    className="w-full aspect-[9/16] rounded-2xl object-cover"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
