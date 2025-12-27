import React from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onStart, onStop }) => {
  // 수정 포인트:
  // 1. w-32 h-32: 너비와 높이를 같게 고정하여 정원(Circle)을 만듭니다.
  // 2. flex flex-col items-center justify-center: 아이콘과 글자를 중앙 정렬합니다.
  // 3. rounded-full: 네모난 박스를 깎아서 원으로 만듭니다.
  const baseStyle = "w-32 h-32 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all duration-300 shadow-lg transform hover:scale-105 border-4 border-white/20";

  if (!isRecording) {
    return (
      <button 
        onClick={onStart} 
        className={`${baseStyle} bg-blue-500 hover:bg-blue-600`}
      >
        {/* 아이콘 크기를 키우고(text-4xl) 글자와 간격(mb-1)을 줌 */}
        <span className="text-4xl mb-1">🎙️</span>
        <span className="text-lg">주문하기</span>
      </button>
    );
  }

  return (
    <button 
      onClick={onStop} 
      // 녹음 중일 때 애니메이션 유지
      className={`${baseStyle} bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-300 ring-offset-2`}
    >
      <span className="text-4xl mb-1">⏹️</span>
      <span className="text-lg">주문 완료</span>
    </button>
  );
};

export default RecordButton;