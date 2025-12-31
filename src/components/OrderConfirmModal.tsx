import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { useState, useEffect } from 'react';
import { fetchPaymentAds } from '../api/AdApi';
import { useFaceDetection } from '../hooks/useFaceDetection';
import type { Ad } from '../types/AdTypes';
import type { CartItem } from '../types/OrderTypes';

interface OrderConfirmModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onPrevious: () => void;
  onCheckout: () => void;
  onRemoveItem: (cartId: string) => void;
}

export default function OrderConfirmModal({
  isOpen,
  cart,
  onClose,
  onPrevious,
  onCheckout,
  onRemoveItem,
}: OrderConfirmModalProps) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const optionsPrice =
      item.selectedBackendOptions?.reduce((acc, opt) => acc + opt.price * opt.quantity, 0) || 0;
    return sum + (item.price + optionsPrice) * item.quantity;
  }, 0);

  // 얼굴 분석 정보 가져오기
  const { analysisData } = useFaceDetection(false); // 이미 분석된 데이터만 사용
  const [ads, setAds] = useState<Ad[]>([]);
  const [adError, setAdError] = useState<string | null>(null);

  // 결제 완료 시 광고 불러오기 (팝업 열릴 때마다)
  useEffect(() => {
    async function loadAds() {
      if (isOpen && analysisData?.age && analysisData?.gender) {
        // age: 27, gender: 'M' → ageGroup: '20대', gender: 'M'
        const age = analysisData.age;
        const ageGroup = age < 20 ? '10대' : age < 30 ? '20대' : age < 40 ? '30대' : age < 50 ? '40대' : '50대';
        try {
          const result = await fetchPaymentAds(ageGroup, analysisData.gender);
          setAds(result);
          setAdError(null);
        } catch (err) {
          setAdError('광고를 불러오지 못했습니다.');
        }
      } else {
        setAds([]);
      }
    }
    loadAds();
  }, [isOpen, analysisData]);

  // [수정] 옵션 렌더링 헬퍼 함수
  const renderOptions = (item: CartItem) => {
    if (item.category === '디저트' || item.category === 'Dessert') return null;

    // 1) 일반 오더: 백엔드 옵션
    if (item.selectedBackendOptions && item.selectedBackendOptions.length > 0) {
      return item.selectedBackendOptions
        .map((opt) => (opt.quantity > 1 ? `${opt.name}(${opt.quantity})` : opt.name))
        .join(' / ');
    }

    // 2) ✅ 이지 오더: temperature 옵션
    // (CartItem 타입에 options가 없을 수도 있으니 안전하게 any로 접근)
    const temp = (item as any).options?.temperature;
    if (temp === 'hot') return 'HOT';
    if (temp === 'cold') return 'ICE';

    return null;
  };

  // [수정] 개별 아이템 가격 계산 헬퍼
  const getItemTotalPrice = (item: CartItem) => {
    const optionsPrice =
      item.selectedBackendOptions?.reduce((acc, opt) => acc + opt.price * opt.quantity, 0) || 0;
    return (item.price + optionsPrice) * item.quantity;
  };

  // Body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* 모달 박스 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-y-[20%] inset-x-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-8 py-6 border-b-2 border-gray-200 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">주문 확인</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-8 h-8 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* 맞춤형 광고 영역 */}
            <div className="px-8 py-4 border-b border-gray-200 bg-yellow-50">
              <h3 className="text-lg font-bold text-yellow-700 mb-2">맞춤형 광고</h3>
              {adError && <div className="text-red-500">{adError}</div>}
              {!adError && ads.length === 0 && <div className="text-gray-400">광고가 없습니다.</div>}
              {!adError && ads.length > 0 && (
                <div className="flex gap-4">
                  {ads.map((ad) => (
                    <div key={ad.adId} className="flex flex-col items-center border rounded-xl p-2 bg-white shadow">
                      <div className="font-bold text-sm mb-1">{ad.title}</div>
                      {ad.mediaType === 'IMAGE' ? (
                        <img src={ad.mediaUrl} alt={ad.title} className="w-32 h-32 object-contain rounded" />
                      ) : (
                        <video src={ad.mediaUrl} controls className="w-32 h-32 rounded" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 주문 내역 영역 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gray-50">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-20 h-20 opacity-20 mb-4" />
                  <span className="text-2xl font-semibold">주문 내역이 없습니다</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.name}</h3>

                        <p className="text-sm text-gray-500 mb-2 font-medium">
                          {renderOptions(item)}
                        </p>

                        <p className="text-sm text-gray-600 mb-2">수량: {item.quantity}개</p>
                        <p className="text-lg font-bold text-orange-600">
                          {/* [수정] 가격 표시 교체 */}
                          {getItemTotalPrice(item).toLocaleString()}원
                        </p>
                      </div>

                      {/* 삭제 버튼만 유지 */}
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 총액 요약 */}
            {cart.length > 0 && (
              <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">주문 항목</span>
                  <span className="font-bold text-gray-900">{totalItems}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">총 결제금액</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex gap-3 px-8 py-5 border-t border-gray-200 bg-white shrink-0">
              <button
                onClick={onPrevious}
                className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-200 transition-colors"
              >
                이전
              </button>
              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="flex-1 py-4 bg-pink-500 text-white font-bold text-lg rounded-2xl hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                결제하기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
