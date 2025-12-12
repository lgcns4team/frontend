// src/components/AudioVisualizer.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  level: number; // 0.0 ~ 1.0 사이의 오디오 레벨
}

const AudioVisualizer: React.FC<Props> = ({ level }) => {
  // 막대 개수 설정
  const bars = 20;

  // 레벨에 따라 높이를 동적으로 계산하는 함수
  // index를 활용하여 각 막대가 조금씩 다르게 움직이도록 함
  const calculateHeight = (index: number) => {
    const baseHeight = 10; // 최소 높이 (px)
    const maxHeight = 80; // 최대 높이 추가분 (px)
    
    // 중앙에 있는 막대가 더 높게 반응하도록 가중치 부여
    const centerWeight = 1 - Math.abs(index - (bars - 1) / 2) * 0.15;
    
    // 약간의 랜덤성 추가
    const randomness = Math.random() * 0.3 + 0.7;

    const targetHeight = baseHeight + (level * maxHeight * centerWeight * randomness);
    
    // 너무 낮거나 높지 않게 제한
    return Math.min(targetHeight, 100);
  };

  return (
    <div className="flex items-center justify-center gap-[3px] h-[32px]">
      {Array.from({ length: bars }).map((_, index) => (
        <motion.div
          key={index}
          className="w-[4px] bg-blue-500 rounded-full"
          // framer-motion을 사용하여 부드럽게 높이 애니메이션 적용
          animate={{
            height: calculateHeight(index),
            backgroundColor: level > 0.2 ? "rgb(59, 130, 246)" : "rgb(147, 197, 253)" // 볼륨이 크면 진한 파랑, 작으면 연한 파랑
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            mass: 0.5
          }}
          style={{
              transformOrigin: "center"
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;