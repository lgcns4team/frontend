import { useEffect, useState } from 'react';
import InsertCardAnimation from './InsertCardAnimation';
import QrScanAnimation from './QrScanAnimation';
import BarcodeScanAnimation from './BarcodeScanAnimation';
import NfcPayAnimation from './NfcPayAnimation';
import { useAds } from '../../hooks/useAds';
import type { Ad, GetAdsResponse } from '../../types/ad';
import { useAnalysisStore } from '../../store/analysisStore';
import { apiClient } from '../../api/ApiClient';

interface PaymentProgressModalProps {
  paymentMethod: 'card' | 'kakaopay' | 'naverpay' | 'samsungpay' | 'applepay' | 'gifticon';
  onClose: () => void;
}
// 주문 번호 생성 함수
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

export default function PaymentProgressModal({
  paymentMethod,
  onClose,
}: PaymentProgressModalProps) {
  const { ads } = useAds();
  const age = useAnalysisStore((s) => s.age);
  const gender = useAnalysisStore((s) => s.gender);

  const [isProcessing, setIsProcessing] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const normalizeGender = (value: string | null | undefined): 'M' | 'F' | 'U' => {
    const v = (value ?? '').trim().toLowerCase();
    if (!v) return 'U';
    if (v === 'm' || v === 'male' || v === 'man' || v.includes('남')) return 'M';
    if (v === 'f' || v === 'female' || v === 'woman' || v.includes('여')) return 'F';
    return 'U';
  };

  const toTargetAgeGroup = (n: number | null): string | null => {
    if (n == null) return null;
    if (!Number.isFinite(n)) return null;
    if (n >= 50) return '50대이상';
    const decade = Math.floor(n / 10) * 10;
    return `${decade}대`;
  };

  const asArrayAds = (data: unknown): Ad[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Ad[];
    if (typeof data === 'object' && data !== null && 'ads' in data) {
      const ads = (data as GetAdsResponse).ads;
      return Array.isArray(ads) ? ads : [];
    }
    return [];
  };

  const pickRandom = (list: Ad[]): Ad | null => {
    const candidates = (list ?? []).filter((a) => !!a?.mediaUrl);
    if (candidates.length === 0) return null;
    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx] ?? null;
  };

  // 1. 5초 후 처리 완료 상태로 변경
  useEffect(() => {
    const processingTimer = setTimeout(() => {
      setIsProcessing(false);
    }, 5000);
    return () => clearTimeout(processingTimer);
  }, []);

  // 2. 완료 시 주문번호 생성
  useEffect(() => {
    if (!isProcessing) {
      setOrderNumber(getOrderNumber());
    }
  }, [isProcessing]);

  // 2-1. 완료 시 타겟팅된 광고를 백엔드에서 가져옴
  useEffect(() => {
    if (isProcessing) return;
    if (selectedAd) return;

    let cancelled = false;

    // 사용자의 나이/성별을 기준으로 타겟팅된 광고를 백엔드에서 요청
    const fetchTargetedAd = async () => {
      try {
        const userAgeGroup = toTargetAgeGroup(age);
        const normalized = normalizeGender(gender);
        const userGender = normalized === 'U' ? null : normalized;

        const params: Record<string, string> = {};
        if (userAgeGroup) params.ageGroup = userAgeGroup;
        if (userGender) params.gender = userGender;

        // 원하는 로직:
        // 1) 타겟룰에 의해 매칭되는 광고가 있으면 그 광고를 1순위로(=랜덤 선택하더라도 '타겟 광고군'에서만)
        // 2) 타겟 매칭 광고가 없으면 전체 광고 리스트에서 랜덤

        // (A) 타겟 파라미터를 포함해 조회
        const targetedRes = await apiClient.get<GetAdsResponse | Ad[]>('/ads/payment', { params });
        const targetedCandidates = asArrayAds(targetedRes.data);

        // (B) 파라미터 없이 조회: "타겟 규칙이 없는(=모든 사용자 대상)" 광고들만 나오는 성질을 이용
        const genericRes = await apiClient.get<GetAdsResponse | Ad[]>('/ads/payment');
        const genericCandidates = asArrayAds(genericRes.data);
        const genericIds = new Set(genericCandidates.map((a) => a.adId));

        // (C) 타겟 조회 결과 중에서 generic에 없는 것만 = "타겟룰로 인해 추가로 매칭된 광고"
        const trulyTargeted = targetedCandidates.filter((a) => !genericIds.has(a.adId));

        const chosen = trulyTargeted.length > 0 ? pickRandom(trulyTargeted) : pickRandom(ads);

        if (!cancelled) {
          setSelectedAd(chosen);
        }
      } catch (e) {
        // API 실패 시 전체 광고 리스트에서 랜덤
        const fallback = pickRandom(ads);
        if (!cancelled) {
          setSelectedAd(fallback);
        }
      }
    };

    fetchTargetedAd();

    return () => {
      cancelled = true;
    };
  }, [age, gender, isProcessing, selectedAd, ads]);

  // 3. [수정됨] 카운트다운 타이머 (숫자만 줄임)
  useEffect(() => {
    if (!isProcessing && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isProcessing, countdown]);

  // 4. [신규] 카운트다운이 0이 되면 onClose 호출 (중복 실행 방지)
  useEffect(() => {
    if (!isProcessing && countdown === 0) {
      onClose();
    }
  }, [isProcessing, countdown, onClose]);

  const getContent = () => {
    if (paymentMethod === 'card') {
      return {
        title: '신용카드 결제',
        processingMessage: '카드를 인식 중입니다...',
        completeMessage: '결제가 완료되었습니다!',
        useAnimation: true,
      };
    } else if (paymentMethod === 'gifticon') {
      return {
        title: '기프티콘 결제',
        instruction: '바코드를 스캔해주세요',
        processingMessage: '기프티콘을 확인 중입니다...',
        completeMessage: '결제가 완료되었습니다!',
        useAnimation: false,
        animationType: 'voucher',
      };
    } else if (paymentMethod === 'samsungpay' || paymentMethod === 'applepay') {
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
              {selectedAd?.mediaUrl && (
                <div className="w-full max-w-lg mx-auto mb-8">
                  {selectedAd.mediaType === 'VIDEO' ? (
                    <video
                      src={selectedAd.mediaUrl}
                      autoPlay
                      muted
                      playsInline
                      className="w-full aspect-[9/16] rounded-2xl object-cover"
                    />
                  ) : (
                    <img
                      src={selectedAd.mediaUrl}
                      alt="advertisement"
                      className="w-full aspect-[9/16] rounded-2xl object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
