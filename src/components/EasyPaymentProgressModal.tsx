// src/components/EasyPaymentProgressModal.tsx
import { useEffect, useState } from 'react';
import InsertCardAnimation from './InsertCardAnimation';

interface EasyPaymentProgressModalProps {
  onComplete: (orderNumber: number) => void;
}

const getOrderNumber = (): number => {
  const today = new Date().toISOString().split('T')[0];
  const storedData = localStorage.getItem('orderData');

  if (storedData) {
    const { date, orderNumber } = JSON.parse(storedData);
    if (date === today) {
      const nextNumber = orderNumber + 1;
      localStorage.setItem('orderData', JSON.stringify({ date: today, orderNumber: nextNumber }));
      return nextNumber;
    }
  }

  localStorage.setItem('orderData', JSON.stringify({ date: today, orderNumber: 1 }));
  return 1;
};

export default function EasyPaymentProgressModal({ onComplete }: EasyPaymentProgressModalProps) {
  const [isProcessing, setIsProcessing] = useState(true);

  //  5초 후 결제 완료 → 주문번호 생성 → 광고로 이동
  useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      const orderNumber = getOrderNumber();
      onComplete(orderNumber);
    }
  }, [isProcessing, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-transparent flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-12 w-[95%] h-[90%] shadow-2xl text-center flex flex-col items-center justify-center overflow-hidden">
          <h2 className="text-4xl font-bold mb-12">신용카드 결제</h2>

          {isProcessing && (
            <>
              <div className="h-[22rem] mb-8 flex items-center justify-center">
                <InsertCardAnimation />
              </div>

              <div className="flex justify-center mb-8">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
              </div>

              <p className="text-xl font-semibold text-gray-700 mb-8">카드를 투입구에 넣어주세요</p>
              <p className="text-md text-gray-500">카드를 인식 중입니다...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
