import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Home } from 'lucide-react';

// [Hooks]
import { useMenu } from '../hooks/UseMenu';
import { useVoiceOrderProcessor } from '../hooks/UseVoiceProcessor'; 
import { useCartStore } from '../store/UseCartStore';

// [Components]
import RecordButton from '../components/VoiceMode/RecordButton';
import BottomCart from '../components/BottomCart';
import OrderConfirmModal from '../components/OrderConfirmModal';
import AudioVisualizer from '../components/VoiceMode/AudioVisualizer';
import BeverageOptionsModal from '../components/OptionsModal';

// [Styles & Assets]
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
import { useAnalysisStore } from '../store/analysisStore';

// AI Core Base URL
const AI_CORE_BASE_URL = 'http://127.0.0.1:8000/nok-nok';

const VoiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);

  // 🆕 얼굴 인식 스토어
  const { setAnalysis, clearAnalysis, isSenior } = useAnalysisStore((s) => ({
    setAnalysis: s.setAnalysis,
    clearAnalysis: s.clearAnalysis,
    isSenior: s.isSenior,
  }));
  const [isLoadingFaceData, setIsLoadingFaceData] = useState(false);

  // 1. 데이터 가져오기 (메뉴, 장바구니)
  const { items, isLoading } = useMenu();
  const { cart, addToCart, removeFromCart } = useCartStore();

  const handleEditOptions = (cartId: string) => {
    const itemToEdit = cart.find((item) => item.cartId === cartId);
    if (itemToEdit) {
      setEditingCartId(cartId);
      setSelectedItem(itemToEdit);
    }
  };

  const handleAddToCartFromModal = (item: any, opts: any, qty: number, backendOptions: any[]) => {
    if (editingCartId) {
      removeFromCart(editingCartId);
    }
    addToCart(item, opts, qty, backendOptions);
    setSelectedItem(null);
    setEditingCartId(null);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setEditingCartId(null);
  };

  // 2. 메뉴 분류
  const recommendedItems = items.filter((item) => item.category === '추천메뉴');
  const normalItems = items.filter((item) => item.category !== '추천메뉴');

  // ⭐️ [핵심] 복잡한 로직은 이 훅 하나로 끝!
  const { logText, isProcessing, isRecording, audioLevel, startRecording, stopRecording, speak } =
    useVoiceOrderProcessor({ items });

  // 3. 페이지 진입 안내
  useEffect(() => {
    speak('화면에 보이는 주문하기 버튼을 눌러 음성주문을 시작해보세요');
    return () => window.speechSynthesis.cancel();
  }, []); // 의존성 배열 비움 (마운트 시 1회 실행)

  // 4. 장바구니 확인 핸들러
  const handleCheckout = () => {
    if (cart.length === 0) {
      speak('장바구니가 비어있습니다');
      alert('장바구니가 비어있습니다.');
      return;
    }
    setIsCartOpen(true);
  };

  // 🆕 처음으로 버튼: 최신 얼굴 인식 데이터를 가져와서 적용 (화면 이동 없음)
  const handleGoHome = async () => {
    if (isLoadingFaceData) return;

    setIsLoadingFaceData(true);
    console.log('🏠 처음으로 버튼 클릭: 최신 얼굴 인식 데이터 확인 중...');

    try {
      // 1. Python 서버에서 최신 얼굴 인식 데이터 가져오기 (타임아웃 3초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500); // 3초 타임아웃

      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('📥 최신 얼굴 인식 데이터 수신:', data);

        // 2. Zustand 스토어에 저장 (50세 이상 여부 자동 계산됨)
        setAnalysis(data);
        console.log('💾 스토어 업데이트 완료:', {
          age: data.age,
          gender: data.gender,
          isSenior: data.age >= 50,
        });
        console.log('✅ 50세 이상 전용 애니메이션 활성화:', data.age >= 50);
      } else {
        console.log('ℹ️ 서버에 얼굴 인식 데이터가 없습니다. 기존 데이터 초기화.');
        // 데이터가 없으면 초기화
        clearAnalysis();
      }
    } catch (err) {
      if (err === 'AbortError') {
        console.warn('⏱️ 데이터 가져오기 시간 초과 (1초)');
      } else {
        console.error('❌ 얼굴 인식 데이터 가져오기 실패:', err);
      }
      // 에러 발생 시 안전하게 초기화
      clearAnalysis();
    } finally {
      setIsLoadingFaceData(false);
    }

    // 🔄 데이터 처리 완료 후 Order 페이지로 이동
    navigate('/order');
  };

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

        {/* 헤더 */}
        <header
          className={`${COLORS.bgPrimary} ${SPACING.headerPadding} flex justify-between items-center shadow-sm z-10 shrink-0`}
        >
          <h1 className={TEXT_STYLES.header}>NOK NOK</h1>
          <button
            onClick={handleGoHome}
            disabled={isLoadingFaceData}
            className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-8 h-8" />
            <span>처음으로</span>
          </button>
        </header>

        {/* 네비게이션 */}
        <div
          className={`${COLORS.bgPrimary} ${SPACING.navSectionPadding} shadow-sm z-10 shrink-0 flex ${SPACING.navGap}`}
        >
          <button
            onClick={() => navigate('/order')}
            className="flex-1 bg-pink-50 p-8 rounded-xl border border-pink-100 flex items-center gap-2 justify-center relative hover:bg-pink-100 hover:border-pink-200 transition-colors group"
          >
            <style>{`.mic-icon { animation: micPulse 1.5s ease-in-out infinite; } @keyframes micPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
            <img src={microphoneIcon} alt="microphone" className="mic-icon w-10 h-10" />
            <span className="font-bold text-pink-900 text-xl">일반 주문</span>
          </button>
          <button
            onClick={() => navigate('/easy')}
            className={`flex-1 bg-orange-50 p-8 rounded-xl border border-orange-100 flex items-center gap-2 justify-center hover:bg-orange-100 hover:border-orange-200 transition-colors group ${
              isSenior ? 'easy-button' : ''
            }`}
          >
            {isSenior && (
              <style>{`
                  .easy-button { animation: easyButtonGlow 0.8s ease-in-out infinite; }
                  @keyframes easyButtonGlow { 0%, 100% { border-color: rgb(254, 208, 121); background-color: rgb(254, 245, 230); box-shadow: 0 0 0 0px rgba(217, 119, 6, 0); } 50% { border-color: rgb(217, 119, 6); background-color: rgb(255, 251, 235); box-shadow: 0 0 12px 2px rgba(217, 119, 6, 0.3); } }
                  .finger-icon { animation: fingerWiggle 0.8s ease-in-out infinite; transform-origin: bottom center; }
                  @keyframes fingerWiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
                `}</style>
            )}
            <img
              src={fingerIcon}
              alt="finger"
              className={`${isSenior ? 'finger-icon ' : ''}w-12 h-12`}
            />
            <span className="font-bold text-orange-900 text-xl">쉬운 주문</span>
          </button>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-gray-50">
          <section className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                메뉴 정보를 불러오고 있어요...
              </div>
            ) : (
              <>
                {/* 추천 메뉴 */}
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
                          onClick={() => speak(`${item.name}입니다.`)}
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
                {/* 전체 메뉴 */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pl-2 border-l-4 border-gray-800">
                    📋 전체 메뉴
                  </h2>
                  <div className={LAYOUT_STYLES.menuGrid}>
                    {normalItems.map((item, index) => (
                      <button
                        key={`norm-${item.id}-${index}`}
                        className={`${CARD_STYLES.menuCard} ${SIZES.menuCardHeight}`}
                        onClick={() => speak(`${item.name}입니다.`)}
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

          {/* 하단 제어 바 */}
          <section
            className={`shrink-0 ${COLORS.bgPrimary} border-t ${COLORS.primary.border} ${SPACING.bottomBarPaddingX} py-6 flex flex-row items-center justify-center gap-12 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 relative min-h-[240px]`}
          >
            <div className="flex flex-col gap-3 h-full justify-center w-[450px] shrink-0">
              <div
                className={`${SPACING.panelPadding} ${
                  BORDERS.largeRadius
                } border text-center transition-all duration-300 flex flex-col items-center justify-center h-[120px] shadow-sm gap-2 ${
                  isRecording
                    ? 'bg-white border-blue-500 border-2 text-blue-600 scale-[1.0] shadow-md'
                    : `${COLORS.blue.bg} ${COLORS.blue.border} text-blue-700`
                }`}
              >
                {isRecording ? (
                  <div className="w-full mb-6">
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
                  onStart={startRecording}
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

        <BeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={handleCloseModal}
          onAdd={handleAddToCartFromModal}
        />

        <OrderConfirmModal
          isOpen={isCartOpen}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onPrevious={() => setIsCartOpen(false)}
          onCheckout={() => navigate('/payment', { state: { directToMethod: true } })}
          onRemoveItem={removeFromCart}
        />
      </div>
    </div>
  );
};

export default VoiceOrder;
