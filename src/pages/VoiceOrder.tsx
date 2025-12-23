import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Home } from 'lucide-react';

// [Hooks & API]
import { useMenu } from '../hooks/UseMenu';
import { useCart } from '../hooks/VoiceuseCart';
import { useRecorder } from '../hooks/UseRecorder';
import { sendAudioOrder } from '../api/VoiceOrderApi';

// [Global Store & Types]
import { useCartStore } from '../store/UseCartStore';
import type { Options } from '../types/OrderTypes';

// [Components]
import RecordButton from '../components/RecordButton';
import BottomCart from '../components/BottomCart';
import OrderConfirmModal from '../components/OrderConfirmModal';
import AudioVisualizer from '../components/AudioVisualizer';

// [Assets]
import microphoneIcon from '../assets/icons/microphone.svg';
import fingerIcon from '../assets/icons/finger.svg';
import {
  TEXT_STYLES,
  SPACING,
  BORDERS,
  COLORS,
  CARD_STYLES,
  LAYOUT_STYLES,
  SIZES,
} from '../styles/designTokens';

const VoiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [logText, setLogText] = useState<string>('파란색 버튼을 누르고\n말씀해주세요');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. 전역 장바구니 스토어 (주문확인 시에만 사용)
  const { addToCart, clearCart: clearGlobalCart, removeFromCart } = useCartStore();
  const globalCart = useCartStore((state) => state.cart);

  const { items, isLoading } = useMenu();
  const { cart, updateCart } = useCart();
  const { isRecording, audioFile, audioLevel, startRecording, stopRecording, resetRecording } =
    useRecorder();

  // 2. VoiceOrder 페이지에 진입할 때 전역 장바구니 초기화
  useEffect(() => {
    clearGlobalCart();
  }, [clearGlobalCart]);

  // 3. 음성 옵션(배열) -> 전역 옵션(객체) 변환 함수
  const convertVoiceOptionsToGlobal = (voiceOptions: string[] = []): Partial<Options> => {
    const options: Partial<Options> = {};

    // 온도 변환
    if (voiceOptions.includes('hot')) options.temperature = 'hot';
    else if (voiceOptions.includes('cold')) options.temperature = 'cold';

    // 사이즈 변환
    if (voiceOptions.includes('tall')) options.size = 'tall';
    else if (voiceOptions.includes('venti')) options.size = 'venti';
    else options.size = 'grande'; // 기본값

    // 샷 추가 (배열에 'shot'이 몇 개 있는지 카운트)
    const shotCount = voiceOptions.filter((opt) => opt === 'shot').length;
    options.shot = shotCount;

    // 얼음 옵션
    if (voiceOptions.includes('less_ice')) options.ice = 'less';
    else if (voiceOptions.includes('more_ice')) options.ice = 'more';
    else options.ice = 'normal';

    // 기타
    if (voiceOptions.includes('whip')) options.whip = true;
    if (voiceOptions.includes('weak')) options.isWeak = true;

    return options;
  };

  // 4. 주문확인 핸들러 (CartSheet 표시)
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    // 음성 장바구니 아이템들을 전역 장바구니로 이동
    cart.forEach((voiceItem) => {
      // 원본 메뉴 정보 찾기 (이미지, 카테고리 등)
      const originalItem = items.find((item) => item.name === voiceItem.name);

      if (originalItem) {
        // 옵션 포맷 변환
        const globalOptions = convertVoiceOptionsToGlobal(voiceItem.option_ids || []);
        // 전역 스토어에 추가
        addToCart(originalItem, globalOptions, voiceItem.quantity);
      } else {
        console.warn(`메뉴를 찾을 수 없습니다: ${voiceItem.name}`);
      }
    });

    // CartSheet 표시 (Order와 동일한 플로우)
    setIsCartOpen(true);
  };

  // 오디오 파일 생성 시 API 전송 로직
  useEffect(() => {
    const processAudio = async () => {
      if (audioFile && !isRecording) {
        setIsProcessing(true);
        setLogText('분석 중입니다...\n잠시만 기다려주세요');

        try {
          const response = await sendAudioOrder(audioFile);

          if (!response.text) {
            setLogText('잘 못 들었어요\n다시 말씀해 주세요');
          } else {
            setLogText(`"${response.text}"\n주문을 확인해주세요`);
            if (response.actions && response.actions.length > 0) {
              updateCart(response.actions);
            }
          }
        } catch (error) {
          console.error(error);
          setLogText('오류가 발생했습니다\n직원을 호출해주세요');
        } finally {
          setIsProcessing(false);
          resetRecording();
        }
      }
    };
    processAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile, isRecording]);

  const handleStart = () => {
    startRecording();
    setLogText('네, 듣고 있어요! 편하게 말씀해주세요');
  };

  const handleEditOptions = () => {
    // VoiceOrder에서는 옵션 편집을 제공하지 않음
    // BottomCart의 onEditOptions prop을 만족시키기 위한 더미 함수
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* 90도 회전된 래퍼 */}
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-gray-50 flex flex-col shadow-2xl relative">
        {/* 로딩 오버레이 */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-white/60 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-900 text-2xl font-bold animate-pulse">주문 분석 중...</p>
          </div>
        )}

        {/* 1. 헤더 */}
        <header
          className={`${COLORS.bgPrimary} ${SPACING.headerPadding} flex justify-between items-center shadow-sm z-10 shrink-0`}
        >
          <h1 className={TEXT_STYLES.header}>NOK NOK</h1>
          <button
            onClick={() => navigate('/')}
            className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-8 h-8" />
            <span>처음으로</span>
          </button>
        </header>

        {/* 2. 네비게이션 버튼 */}
        <div
          className={`${COLORS.bgPrimary} ${SPACING.navSectionPadding} shadow-sm z-10 shrink-0 flex ${SPACING.navGap}`}
        >
          <button
            onClick={() => navigate('/order')}
            className="flex-1 bg-pink-50 p-8 rounded-xl border border-pink-100 flex items-center gap-2 justify-center relative hover:bg-pink-100 hover:border-pink-200 transition-colors group"
          >
            <style>{`
              .wave-bar {
                animation: wave 1s linear infinite;
                animation-delay: calc(1s - var(--delay));
                opacity: 0.7;
                transition: opacity 0.3s ease;
              }
              .group:hover .wave-bar {
                opacity: 1;
              }
              @keyframes wave {
                0% { transform: scale(0); }
                50% { transform: scale(1); }
                100% { transform: scale(0); }
              }
              .mic-icon {
                animation: micPulse 1.5s ease-in-out infinite;
              }
              @keyframes micPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            `}</style>
            <img src={microphoneIcon} alt="microphone" className="mic-icon w-10 h-10" />
            <span className="font-bold text-pink-900 text-xl">일반 주문</span>
          </button>

          <button
            onClick={() => navigate('/easy')}
            className="flex-1 bg-orange-50 p-8 rounded-xl border border-orange-100 flex items-center gap-2 justify-center hover:bg-orange-100 hover:border-orange-200 transition-colors group easy-button"
          >
            <style>{`
              .easy-button {
                animation: easyButtonGlow 0.8s ease-in-out infinite;
              }
              @keyframes easyButtonGlow {
                0%, 100% { 
                  border-color: rgb(254, 208, 121);
                  background-color: rgb(254, 245, 230);
                  box-shadow: 0 0 0 0px rgba(217, 119, 6, 0);
                }
                50% { 
                  border-color: rgb(217, 119, 6);
                  background-color: rgb(255, 251, 235);
                  box-shadow: 0 0 12px 2px rgba(217, 119, 6, 0.3);
                }
              }
              .finger-icon {
                animation: fingerWiggle 0.8s ease-in-out infinite;
                transform-origin: bottom center;
              }
              @keyframes fingerWiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-8deg); }
                75% { transform: rotate(8deg); }
              }
            `}</style>
            <img src={fingerIcon} alt="finger" className="finger-icon w-12 h-12" />
            <span className="font-bold text-orange-900 text-xl">쉬운 주문</span>
          </button>
        </div>

        {/* 3. 메인 컨텐츠 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-gray-50">
          {/* [A] 메뉴 리스트 (참고용) */}
          <section className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pl-2 border-l-4 border-gray-800">
              📋 전체 메뉴
            </h2>
            {isLoading ? (
              <div className="h-40 flex items-center justify-center text-gray-400">
                메뉴 로딩 중...
              </div>
            ) : (
              <div className={LAYOUT_STYLES.menuGrid}>
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={`${CARD_STYLES.menuCard} ${SIZES.menuCardHeight}`}
                    onClick={() => alert(`"${item.name}"\n음성으로 주문하시면 편리합니다!`)}
                  >
                    <span className={`${TEXT_STYLES.menuCardTitle} leading-tight break-keep`}>
                      {item.name}
                    </span>
                    <span className={`${TEXT_STYLES.menuCardPrice} text-gray-500`}>
                      {item.price.toLocaleString()}원
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* [B] 음성 주문 제어 영역 (하단 고정) */}
          <section
            className={`shrink-0 ${COLORS.bgPrimary} border-t ${COLORS.primary.border} ${SPACING.bottomBarPaddingX} py-6 flex flex-row items-center justify-center gap-12 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 relative min-h-[240px]`}
          >
            {/* === 왼쪽: 텍스트 박스 영역 === */}
            <div className="flex flex-col gap-3 h-full justify-center w-[450px] shrink-0">
              {/* 1. 안내 멘트 & 비주얼라이저 박스 */}
              <div
                className={`${SPACING.panelPadding} ${
                  BORDERS.largeRadius
                } border text-center transition-all duration-300 flex flex-col items-center justify-center h-[120px] shadow-sm gap-2
                        ${
                          isRecording
                            ? 'bg-white border-blue-500 border-2 text-blue-600 scale-[1.0] shadow-md'
                            : `${COLORS.blue.bg} ${COLORS.blue.border} text-blue-700`
                        }`}
              >
                {/* 비주얼라이저 (녹음 중에만 표시) */}
                {isRecording ? (
                  <div className="w-full mb-6 ">
                    <AudioVisualizer level={audioLevel} />
                  </div>
                ) : null}

                <p className="text-xl font-bold leading-tight">{logText}</p>
              </div>

              {/* 2. 주문 예시 박스 */}
              <div
                className={`${COLORS.bgTertiary} ${SPACING.panelPadding} ${BORDERS.largeRadius} border ${COLORS.primary.border} flex flex-col justify-center min-h-[80px] text-gray-500 shadow-inner`}
              >
                <div className="flex items-center gap-2 mb-1 text-gray-600 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span>이렇게 말해보세요</span>
                </div>
                <p className="text-lg font-medium text-gray-700 pl-1">
                  "아이스 아메리카노 한 잔 줘"
                </p>
              </div>
            </div>

            {/* === 중앙: 버튼 영역 === */}
            <div className="shrink-0 relative flex items-center justify-center">
              {/* 핑 효과 */}
              {!isRecording && !isProcessing && (
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 scale-[1.5]"></div>
              )}

              {/* 버튼 래퍼 */}
              <div className="transform scale-[1.3] origin-center relative z-10 drop-shadow-lg active:scale-[1.5] transition-transform">
                <RecordButton
                  isRecording={isRecording}
                  onStart={handleStart}
                  onStop={stopRecording}
                />
              </div>
            </div>
          </section>
        </main>

        {/* 4. 하단 장바구니 */}
        <BottomCart
          onCheckout={handleCheckout}
          onEditOptions={handleEditOptions}
          orderMethod={orderMethod}
          onOrderMethodChange={setOrderMethod}
        />

        {/* 5. 주문 확인 모달 */}
        <OrderConfirmModal
          isOpen={isCartOpen}
          cart={globalCart}
          onClose={() => setIsCartOpen(false)}
          onPrevious={() => setIsCartOpen(false)}
          onCheckout={() => {
            navigate('/payment', { state: { directToMethod: true } });
          }}
          onRemoveItem={removeFromCart}
        />
      </div>
    </div>
  );
};

export default VoiceOrder;
