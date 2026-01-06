import { useEffect, useState } from 'react';
import InsertCardAnimation from './InsertCardAnimation';
import QrScanAnimation from './QrScanAnimation';
import BarcodeScanAnimation from './BarcodeScanAnimation';
import NfcPayAnimation from './NfcPayAnimation';
import { useAds } from '../../hooks/useAds';
import type { Ad } from '../../types/ad';
import { useAnalysisStore } from '../../store/analysisStore';

interface PaymentProgressModalProps {
  paymentMethod: 'card' | 'kakaopay' | 'naverpay' | 'samsungpay' | 'applepay' | 'gifticon';
  onClose: () => void;
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
    if (n >= 60) return '60대이상';
    const decade = Math.floor(n / 10) * 10;
    return `${decade}대`;
  };

  /**
   * 광고의 타겟팅 나이대 값을 표준 형식으로 정규화합니다.
   * 백엔드에서 다양한 형식으로 올 수 있으므로 정규화합니다.
   */
  const normalizeTargetAgeGroup = (value: string | null | undefined): string | null => {
    const v = (value ?? '').trim();
    if (!v) return null;
    if (v.includes('이상')) return '60대이상';

    const digits = v.replace(/[^0-9]/g, '');
    if (!digits) return null;
    const num = Number.parseInt(digits, 10);
    if (!Number.isFinite(num)) return null;
    if (num >= 60) return '60대이상';

    const decade = Math.floor(num / 10) * 10;
    return `${decade}대`;
  };

  /**
   * 광고의 타겟팅 규칙을 추출합니다.
   * useAds에서 이미 정규화되었으므로 targetRules를 바로 사용합니다.
   */
  const getRules = (ad: Ad): Array<{ ageGroup?: string | null; gender?: string | null }> => {
    // useAds에서 이미 정규화되므로, targetRules가 있으면 바로 사용
    if (Array.isArray(ad.targetRules) && ad.targetRules.length > 0) {
      return ad.targetRules;
    }
    // targetRules가 없으면 전체 대상 (모든 사용자)
    return [{ ageGroup: null, gender: null }];
  };

  /**
   * 사용자가 타겟팅 규칙에 매칭되는지 판단하고 점수를 계산합니다.
   * 점수: -1(불일치), 0(조건없음), 1(한가지일치), 2(모두일치)
   */
  const matchScore = (
    rule: { ageGroup?: string | null; gender?: string | null },
    userAgeGroup: string | null,
    userGender: string | null
  ): number => {
    const rg = normalizeTargetAgeGroup(rule.ageGroup);
    const ug = userAgeGroup;
    if (rg && ug && rg !== ug) return -1;

    // rule.gender가 NULL이면 성별 무관
    if (rule.gender != null && rule.gender !== '') {
      const rGender = normalizeGender(rule.gender);
      const uGender = normalizeGender(userGender);
      if (rGender !== 'U' && uGender !== 'U' && rGender !== uGender) return -1;
    }

    const specificity = (rg ? 1 : 0) + (rule.gender != null && rule.gender !== '' ? 1 : 0);
    return specificity;
  };

  /**
   * 광고 풀에서 사용자에게 가장 적합한 광고를 선택합니다.
   * 선택 기준: 타겟팅 점수 높은 순, 같으면 광고ID 낮은 순
   */
  const pickTargetedAd = (pool: Ad[]): Ad | null => {
    if (!pool || pool.length === 0) return null;

    const userAgeGroup = toTargetAgeGroup(age);
    const userGender = normalizeGender(gender) === 'U' ? null : normalizeGender(gender);

    let best: { ad: Ad; score: number } | null = null;

    for (const ad of pool) {
      const rules = getRules(ad);
      const scores = rules.map((r) => matchScore(r, userAgeGroup, userGender));
      const s = Math.max(...scores);
      if (s < 0) {
        continue;
      }

      if (!best || s > best.score || (s === best.score && ad.adId < best.ad.adId)) {
        best = { ad, score: s };
      }
    }

    return best?.ad ?? null;
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

  // 2-1. 완료 시 타겟 광고 선택 (백엔드 우선 / 없으면 로컬 폴백 결과)
  useEffect(() => {
    if (isProcessing) return;
    if (selectedAd) return;
    if (!ads || ads.length === 0) return;

    // 결제 완료 팝업에서는 이미지 광고를 우선 사용합니다.
    const imageAds = ads.filter((a) => a.mediaType === 'IMAGE');
    const pool = imageAds.length > 0 ? imageAds : ads;

    setSelectedAd(pickTargetedAd(pool));
  }, [ads, age, gender, isProcessing, selectedAd]);

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
