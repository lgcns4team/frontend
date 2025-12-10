import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MousePointer2, Sparkles, Lightbulb } from 'lucide-react'; // Lightbulb 아이콘 추가

// [Hooks]
import { useMenu } from '../hooks/UseMenu'; 
import { useCart } from '../hooks/VoiceuseCart';
import { useRecorder } from '../hooks/UseRecorder';
import { sendAudioOrder } from '../api/VoiceOrderApi';

// [Components]
import RecordButton from '../components/RecordButton';
import VoiceBottomCart from '../components/VoiceBottomCart';

const VoiceOrder: React.FC = () => {
  const navigate = useNavigate();
  // 안내 멘트를 두 줄로 나누어 가독성 높임
  const [logText, setLogText] = useState<string>("파란색 버튼을 누르고\n말씀해주세요");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { items, isLoading } = useMenu();
  const { cart, updateCart, clearCart, totalAmount } = useCart();
  
  const handleUpdateQuantity = (id: string, delta: number) => {
    console.log("수량 조절:", id, delta);
  };

  const handleAudioData = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setLogText("분석 중입니다...\n잠시만 기다려주세요");
    try {
      const { text, actions } = await sendAudioOrder(audioBlob);
      if (!text) setLogText("잘 못 들었어요\n다시 말씀해 주세요");
      else {
         // 나중에 이 부분이 '주문 예시' 박스로 들어가게 됩니다.
         setLogText(`"${text}"\n주문을 확인해주세요`);
         updateCart(actions);
      }
    } catch (error) {
      console.error(error);
      setLogText("오류가 발생했습니다\n직원을 호출해주세요");
    } finally {
      setIsProcessing(false);
    }
  };

  const { isRecording, startRecording, stopRecording } = useRecorder(handleAudioData);
  const handleStart = () => {
    startRecording();
    setLogText("듣고 있어요...\n말씀해주세요 🎤");
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

        {/* 1. 헤더 */}
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
          <button onClick={() => navigate("/")} className="text-sm text-gray-400 underline">홈으로</button>
        </header>

        {/* 2. 네비게이션 버튼 */}
        <div className="bg-white px-4 py-3 shadow-sm z-10 shrink-0 flex gap-3">
            <button 
                onClick={() => navigate("/order")} 
                className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-2 justify-center transition-colors active:scale-95"
            >
              <MousePointer2 className="text-blue-600 w-6 h-6"/> 
              <span className="font-bold text-blue-700 text-lg">터치주문(일반)</span>
            </button>

            <button 
                onClick={() => navigate("/easy")} 
                className="flex-1 bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center gap-2 justify-center"
            >
              <Sparkles className="text-orange-500 w-6 h-6"/> 
              <span className="font-bold text-orange-600 text-lg">쉬운주문</span>
            </button>
        </div>

        {/* 3. 메인 컨텐츠 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-gray-50">
            
            {/* [A] 메뉴 리스트 */}
            <section className="flex-1 overflow-y-auto p-4 no-scrollbar">
                <h2 className="text-lg font-bold text-gray-800 mb-4 pl-2 border-l-4 border-gray-800">
                   📋 전체 메뉴
                </h2>
                {isLoading ? (
                    <div className="h-40 flex items-center justify-center text-gray-400">메뉴 로딩 중...</div>
                ) : (
                    <div className="grid grid-cols-3 gap-3 pb-4">
                        {items.map((item) => (
                            <button 
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 h-20 shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                                onClick={() => alert(`"${item.name}"\n음성으로 주문하시면 편리합니다!`)}
                            >
                                <span className="font-bold text-gray-800 text-lg leading-tight break-keep">
                                    {item.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {item.price.toLocaleString()}원
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* [B] 음성 주문 제어 영역 (대폭 수정됨) */}
            <section className="shrink-0 bg-white border-t border-gray-200 px-8 py-20 flex flex-row items-center justify-between gap-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 relative min-h-[280px]">
                 
                 {/* === 왼쪽: 텍스트 박스 영역 (세로 스택) === */}
                 <div className="flex-1 flex flex-col gap-4 h-full justify-center max-w-[60%]">
                     
                     {/* 1. 안내 멘트 박스 (상태에 따라 색상 변경) */}
                     <div className={`p-6 rounded-[2rem] border text-center transition-all duration-300 flex items-center justify-center min-h-[100px] shadow-sm
                        ${isRecording ? 'bg-blue-600 border-blue-600 text-white scale-[1.02]' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <p className="font-extrabold text-2xl whitespace-pre-wrap leading-snug">{logText}</p>
                     </div>

                     {/* 2. 주문 예시 / 인식 결과 박스 (나중에 텍스트가 들어올 곳) */}
                     <div className="bg-gray-100 p-5 rounded-[2rem] border border-gray-200 flex flex-col justify-center min-h-[90px] text-gray-500 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 text-gray-600 font-bold">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            <span>이렇게 말해보세요</span>
                        </div>
                        <p className="text-xl font-medium text-gray-700 pl-1">"아이스 아메리카노 한 잔 줘"</p>
                     </div>
                 </div>


                 {/* === 오른쪽: 슈퍼 사이즈 버튼 영역 === */}
                 <div className="shrink-0 relative flex items-center justify-center p-6 mr-20">
                    {/* 핑 효과 (버튼 크기에 맞춰 확대) */}
                    {!isRecording && !isProcessing && (
                         <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 scale-[2.0]"></div>
                    )}

                    {/* 버튼 래퍼  */}
                    <div className="transform scale-[2.0] origin-center relative z-10 drop-shadow-2xl active:scale-[2.4] transition-transform">
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
        <VoiceBottomCart 
            cart={cart} 
            totalAmount={totalAmount}
            onCheckout={() => alert("결제를 진행합니다.")}
            onClear={clearCart}
            onUpdateQuantity={handleUpdateQuantity}
        />
        
      </div>
    </div>
  );
};

export default VoiceOrder;