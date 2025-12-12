import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MousePointer2, Sparkles, Lightbulb } from 'lucide-react';

// [Hooks & API]
import { useMenu } from '../hooks/UseMenu'; 
import { useCart } from '../hooks/VoiceuseCart';
import { useRecorder } from '../hooks/UseRecorder'; // UseRecorder.ts
import { sendAudioOrder } from '../api/VoiceOrderApi'; // sendAudioOrder

// [Components]
import RecordButton from '../components/RecordButton';
import VoiceBottomCart from '../components/VoiceBottomCart';
// ✅ 비주얼라이저 컴포넌트 import (경로 확인해주세요)
import AudioVisualizer from '../components/AudioVisualizer'; 

const VoiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [logText, setLogText] = useState<string>("파란색 버튼을 누르고\n말씀해주세요");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { items, isLoading } = useMenu();
  const { cart, updateCart, clearCart, totalAmount, changeQuantity, removeItem } = useCart();
  
  // ✅ audioLevel 받아오기 (UseRecorder 훅에서 지원해야 함)
  const { 
    isRecording, 
    audioFile, 
    audioLevel, 
    startRecording, 
    stopRecording, 
    resetRecording 
  } = useRecorder();

  // 오디오 파일 생성 시 API 전송 로직
  useEffect(() => {
      const processAudio = async () => {
        if (audioFile && !isRecording) {
          setIsProcessing(true); // 로딩 시작
          setLogText("분석 중입니다...\n잠시만 기다려주세요");
          
          try {
            const response = await sendAudioOrder(audioFile);
            
            if (!response.text) {
                setLogText("잘 못 들었어요\n다시 말씀해 주세요");
            } else {
                setLogText(`"${response.text}"\n주문을 확인해주세요`);
                if (response.actions && response.actions.length > 0) {
                    updateCart(response.actions);
                }
            }
          } catch (error) {
            console.error(error);
            setLogText("오류가 발생했습니다\n직원을 호출해주세요");
          } finally {
            setIsProcessing(false); // 로딩 끝
            resetRecording();
          }
        }
      };
      processAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioFile, isRecording]);

  const handleStart = () => {
    startRecording();
    setLogText("네, 듣고 있어요! 편하게 말씀해주세요");
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* 원래 디자인: 90도 회전된 래퍼 */}
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
            
            {/* [A] 메뉴 리스트 (참고용) */}
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

            {/* [B] 음성 주문 제어 영역 (하단 고정) */}
            <section className="shrink-0 bg-white border-t border-gray-200 px-8 py-20 flex flex-row items-center justify-between gap-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 relative min-h-[280px]">
                 
                 {/* === 왼쪽: 텍스트 박스 영역 === */}
                 <div className="flex-1 flex flex-col gap-4 h-full justify-center max-w-[60%]">
                     
                     {/* 1. 안내 멘트 & 비주얼라이저 박스 */}
                     {/* isRecording일 때 배경을 흰색으로 바꾸고 테두리를 진하게 해서 파란색 비주얼라이저가 잘 보이게 했습니다 */}
                     <div className={`p-6 rounded-[2rem] border text-center transition-all duration-300 flex flex-col items-center justify-center h-[190px] shadow-sm gap-2
                        ${isRecording 
                            ? 'bg-white border-blue-500 border-2 text-blue-600 scale-[1.02] shadow-md' // 녹음 중 스타일 (흰 배경 + 파란 테두리)
                            : 'bg-blue-50 border-blue-200 text-blue-800' // 대기 중 스타일
                        }`}>
                        
                        {/* ✅ [추가됨] 비주얼라이저 (녹음 중에만 표시) */}
                        {isRecording ? (
                            <div className="w-full mb-8 ">
                                <AudioVisualizer level={audioLevel} />
                            </div>
                        ) : null}

                        <p className="font-extrabold text-2xl whitespace-pre-wrap leading-snug">{logText}</p>
                     </div>

                     {/* 2. 주문 예시 박스 */}
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
                    {/* 핑 효과 */}
                    {!isRecording && !isProcessing && (
                         <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 scale-[2.0]"></div>
                    )}

                    {/* 버튼 래퍼 */}
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
            onUpdateQuantity={changeQuantity}
            onRemoveItem={removeItem}
        />
        
      </div>
    </div>
  );
};

export default VoiceOrder;