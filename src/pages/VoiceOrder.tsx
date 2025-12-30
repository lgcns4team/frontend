import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Home } from 'lucide-react';

// [Hooks & API]
import { useMenu } from '../hooks/UseMenu';
import { useRecorder } from '../hooks/UseRecorder';
import { sendAudioOrder } from '../api/VoiceOrderApi';
import { fetchMenuOptions } from '../api/MenuApi'; // ⭐️ 옵션 조회 API 추가

// [Global Store & Types]
import { useCartStore } from '../store/UseCartStore';
import type { Options } from '../types/OrderTypes';

// [Components]
import RecordButton from '../components/VoiceMode/RecordButton';
import BottomCart from '../components/BottomCart';
import OrderConfirmModal from '../components/OrderConfirmModal';
import AudioVisualizer from '../components/VoiceMode/AudioVisualizer';

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

  // 침묵 감지를 위한 Ref
  const lastHeardTimeRef = useRef<number>(0);
  const silenceCheckIntervalRef = useRef<number | null>(null);

  // 1. 전역 장바구니 스토어 사용
  // (VoiceuseCart 훅은 제거하고 스토어 직접 사용으로 변경)
  const { addToCart, removeFromCart, clearCart } = useCartStore();
  const cart = useCartStore((state) => state.cart);

  // ⭐️ [중요] items를 먼저 가져옵니다.
  const { items, isLoading } = useMenu();

  // 메뉴 분류 로직 (기존 디자인 유지)
  const recommendedItems = items.filter((item) => item.category === '추천메뉴');
  const normalItems = items.filter((item) => item.category !== '추천메뉴');

  // 2. 녹음 관련 Hooks
  const { isRecording, audioFile, audioLevel, startRecording, stopRecording, resetRecording } = useRecorder();

  // === [TTS 기능] ===
  const speak = (message: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ko-KR'; 
      utterance.rate = 1.2; 
      utterance.pitch = 1.0; 
      window.speechSynthesis.speak(utterance);
    }
  };

  // 3. 페이지 진입 초기화 (장바구니 초기화 로직 삭제됨 -> 기존 장바구니 유지)
  useEffect(() => {
    speak('화면에 보이는 주문하기 버튼을 눌러 음성주문을 시작해보세요');
    
    return () => {
      window.speechSynthesis.cancel();
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
    };
  }, []); 

  // === [침묵 감지 로직] ===
  useEffect(() => {
    if (isRecording && audioLevel > 0.05) {
      lastHeardTimeRef.current = Date.now();
    }
  }, [isRecording, audioLevel]);

  useEffect(() => {
    if (isRecording) {
      lastHeardTimeRef.current = Date.now();
      silenceCheckIntervalRef.current = window.setInterval(() => {
        const silenceDuration = Date.now() - lastHeardTimeRef.current;
        
        if (silenceDuration > 5000) {
          stopRecording();
          setLogText('말씀이 없으셔서\n자동으로 종료되었어요');
          speak('말씀이 없으셔서 자동으로 종료되었어요');
          if (silenceCheckIntervalRef.current) {
            clearInterval(silenceCheckIntervalRef.current);
          }
        }
      }, 1000); 
    } else {
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
    }
  }, [isRecording, stopRecording]);

  // ⭐️ [핵심] 음성 태그를 실제 DB 옵션 ID로 변환하는 함수 (새로 추가됨)
  const resolveBackendOptions = async (menuId: number, voiceTags: string[]) => {
    try {
      // 1. 해당 메뉴의 전체 옵션 그룹을 서버에서 가져옴
      const optionGroups = await fetchMenuOptions(menuId);
      const resolvedOptions: { optionItemId: number; quantity: number; price: number; name: string }[] = [];
      const globalOptions: Partial<Options> = {}; // 프론트 표시용

      // 헬퍼: 키워드로 옵션 찾기
      const findOption = (keywords: string[]) => {
        for (const group of optionGroups) {
          for (const opt of group.options) {
            if (keywords.some(k => opt.name.toLowerCase().includes(k))) {
              return opt;
            }
          }
        }
        return null;
      };

      // 2. 태그별 매칭 로직 (SQL DB 기준 명칭 매핑)
      // 온도
      if (voiceTags.includes('hot')) {
        const opt = findOption(['hot', '따뜻']);
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
          globalOptions.temperature = 'hot';
        }
      } else if (voiceTags.includes('cold')) {
        const opt = findOption(['ice', '아이스', '차가운']);
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
          globalOptions.temperature = 'cold';
        }
      }

      // 사이즈
      if (voiceTags.includes('tall')) {
        const opt = findOption(['tall', '톨']);
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
          globalOptions.size = 'tall';
        }
      } else if (voiceTags.includes('grande')) {
        const opt = findOption(['grande', '그란데']);
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
          globalOptions.size = 'grande';
        }
      } else if (voiceTags.includes('venti')) {
        const opt = findOption(['venti', '벤티']);
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
          globalOptions.size = 'venti';
        }
      }

      // 샷 추가
      const shotCount = voiceTags.filter(t => t === 'shot').length;
      if (shotCount > 0) {
        const opt = findOption(['shot', '샷']);
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: shotCount, price: opt.optionPrice, name: opt.name });
          globalOptions.shot = shotCount;
        }
      }

      // 휘핑
      if (voiceTags.includes('whip')) {
        const opt = findOption(['휘핑 크림 추가', '휘핑']); 
        if (opt) {
          resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
          globalOptions.whip = true;
        }
      }

      // 얼음량
      if (voiceTags.includes('less_ice')) {
        const opt = findOption(['적게']);
        if (opt) {
           resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
           globalOptions.ice = 'less';
        }
      } else if (voiceTags.includes('more_ice')) {
        const opt = findOption(['많이']);
        if (opt) {
           resolvedOptions.push({ optionItemId: opt.optionItemId, quantity: 1, price: opt.optionPrice, name: opt.name });
           globalOptions.ice = 'more';
        }
      }

      return { backendOptions: resolvedOptions, globalOptions };

    } catch (error) {
      console.error("옵션 매핑 중 에러:", error);
      return { backendOptions: [], globalOptions: {} };
    }
  };

  // ⭐️ [핵심] 음성 액션 처리기 (장바구니 추가 로직)
  const handleVoiceActions = async (actions: any[]) => {
    for (const action of actions) {
      if (action.type === 'ADD') {
        const targetItem = items.find(i => i.name === action.data.name);
        if (targetItem) {
          // 비동기로 옵션 ID 조회 후 추가
          const { backendOptions, globalOptions } = await resolveBackendOptions(targetItem.id, action.data.option_ids || []);
          addToCart(targetItem, globalOptions, action.data.quantity || 1, backendOptions);
        }
      } 
      else if (action.type === 'UPDATE') {
        if (action.targetId === 'last_item' && cart.length > 0) {
           const lastItem = cart[cart.length - 1];
           removeFromCart(lastItem.cartId); // 기존 것 삭제 후 다시 추가
           const { backendOptions, globalOptions } = await resolveBackendOptions(lastItem.id, action.data.option_ids || []);
           addToCart(lastItem, globalOptions, lastItem.quantity, backendOptions);
        }
      }
      else if (action.type === 'REMOVE') {
         if (action.id === 'last_item' && cart.length > 0) {
             removeFromCart(cart[cart.length - 1].cartId);
         }
      }
    }
  };

  // 4. 주문확인 핸들러
  const handleCheckout = () => {
    if (cart.length === 0) {
      speak('장바구니가 비어있습니다');
      alert('장바구니가 비어있습니다.');
      return;
    }
    // 별도 변환 과정 없이 바로 오픈 (이미 스토어에 정확한 데이터가 있음)
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
            speak('잘 못 들었어요. 다시 말씀해 주세요');
          } else {
            setLogText(`"${response.text}"\n주문을 확인해주세요`);
            if (response.actions && response.actions.length > 0) {
              
              // [수정] 위에서 만든 핸들러 호출
              await handleVoiceActions(response.actions);
              
              speak('말씀하신 메뉴가 장바구니에 담겼어요');
            } else {
               speak('주문하실 메뉴를 말씀해 주세요');
            }
          }
        } catch (error) {
          console.error(error);
          setLogText('오류가 발생했습니다\n직원을 호출해주세요');
          speak('오류가 발생했습니다. 직원을 호출해주세요');
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
    window.speechSynthesis.cancel();
    startRecording();
    setLogText('네, 듣고 있어요! 편하게 말씀해주세요');
  };

  const handleEditOptions = () => {};

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
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
          
          {/* [수정 2] 메뉴 리스트 영역 (분리 렌더링 - 기존 디자인 복구) */}
          <section className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide">
            
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                메뉴 정보를 불러오고 있어요...
              </div>
            ) : (
              <>
                {/* A. 추천 메뉴 섹션 */}
                {recommendedItems.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 pl-2 border-l-4 border-red-500 flex items-center gap-2">
                      🔥 추천 메뉴
                    </h2>
                    <div className={LAYOUT_STYLES.menuGrid}>
                      {recommendedItems.map((item, index) => (
                        <button
                          key={`rec-${item.id}-${index}`}
                          className={`${CARD_STYLES.menuCard} ${SIZES.menuCardHeight} ring-2 ring-red-100 bg-red-50/30`} 
                          onClick={() => {
                            speak(`${item.name}입니다.`);
                          }}
                        >
                          <span className={`${TEXT_STYLES.menuCardTitle} leading-tight break-keep`}>
                            {item.name}
                          </span>
                          <span className={`${TEXT_STYLES.menuCardPrice} text-red-600 font-bold`}>
                            {item.price.toLocaleString()}원
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* B. 전체 메뉴 섹션 */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pl-2 border-l-4 border-gray-800">
                    📋 전체 메뉴
                  </h2>
                  <div className={LAYOUT_STYLES.menuGrid}>
                    {normalItems.map((item, index) => (
                      <button
                        key={`norm-${item.id}-${index}`}
                        className={`${CARD_STYLES.menuCard} ${SIZES.menuCardHeight}`}
                        onClick={() => {
                          speak(`${item.name}입니다.`);
                        }}
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
                </div>
              </>
            )}
          </section>

          {/* [B] 음성 주문 제어 영역 (하단 고정) */}
          <section
            className={`shrink-0 ${COLORS.bgPrimary} border-t ${COLORS.primary.border} ${SPACING.bottomBarPaddingX} py-6 flex flex-row items-center justify-center gap-12 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 relative min-h-[240px]`}
          >
            <div className="flex flex-col gap-3 h-full justify-center w-[450px] shrink-0">
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
                {/* 비주얼라이저 */}
                {isRecording ? (
                  <div className="w-full mb-6 ">
                    <AudioVisualizer level={audioLevel} />
                  </div>
                ) : null}

                <p className="text-xl font-bold leading-tight">{logText}</p>
              </div>

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

            <div className="shrink-0 relative flex items-center justify-center">
              {!isRecording && !isProcessing && (
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 scale-[1.5]"></div>
              )}

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

        <BottomCart
          onCheckout={handleCheckout}
          onEditOptions={handleEditOptions}
          orderMethod={orderMethod}
          onOrderMethodChange={setOrderMethod}
        />

        <OrderConfirmModal
          isOpen={isCartOpen}
          cart={cart}
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