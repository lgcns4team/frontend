// src/components/AudioVisualizer.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  level: number; 
}

const AudioVisualizer: React.FC<Props> = ({ level }) => {

  const bars = 20;


  const calculateHeight = (index: number) => {
    const baseHeight = 10; 
    const maxHeight = 80; 
    

    const centerWeight = 1 - Math.abs(index - (bars - 1) / 2) * 0.15;
    

    const randomness = Math.random() * 0.3 + 0.7;

    const targetHeight = baseHeight + (level * maxHeight * centerWeight * randomness);
    
    return Math.min(targetHeight, 100);
  };

  return (
    <div className="flex items-center justify-center gap-[3px] h-[32px]">
      {Array.from({ length: bars }).map((_, index) => (
        <motion.div
          key={index}
          className="w-[4px] bg-blue-500 rounded-full"
         
          animate={{
            height: calculateHeight(index),
            backgroundColor: level > 0.2 ? "rgb(59, 130, 246)" : "rgb(147, 197, 253)" 
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