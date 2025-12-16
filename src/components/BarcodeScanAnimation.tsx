interface BarcodeScanAnimationProps {
  size?: number;
  loop?: boolean;
  className?: string;
}

export default function BarcodeScanAnimation({
  size = 280,
  loop = true,
  className = '',
}: BarcodeScanAnimationProps) {
  const barcodeWidth = size * 0.6;
  const barcodeHeight = size * 0.35;
  const barcodePaddingX = (size - barcodeWidth) / 2;
  const barcodePaddingY = (size - barcodeHeight) / 2;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="바코드 스캔 중"
      role="img"
    >
      <style>{`
        @keyframes scanLineHorizontal {
          0% {
            transform: translateX(0);
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(${barcodeWidth}px);
            opacity: 0.2;
          }
        }

        @keyframes barcodePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .barcode-scan-line {
          animation: scanLineHorizontal 2.5s ease-in-out ${loop ? 'infinite' : '1'};
          transform-origin: left;
          filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.6));
        }

        .barcode-pattern {
          animation: barcodePulse 1.5s ease-in-out ${loop ? 'infinite' : '1'};
        }
      `}</style>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scanLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 0, 0, 0)" />
            <stop offset="50%" stopColor="rgba(255, 0, 0, 0.9)" />
            <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
          </linearGradient>
        </defs>

        {/* 바코드 배경 */}
        <rect
          x={barcodePaddingX}
          y={barcodePaddingY}
          width={barcodeWidth}
          height={barcodeHeight}
          fill="white"
          stroke="#ddd"
          strokeWidth="1"
          rx="2"
        />

        {/* 바코드 패턴 (검은색 세로 바) */}
        <g className="barcode-pattern">
          {Array.from({ length: 35 }).map((_, i) => {
            const barWidth = barcodeWidth / 35;
            const isWide = i % 4 === 0 || i % 4 === 2;
            const width = isWide ? barWidth * 1.2 : barWidth * 0.8;
            const isFilled = Math.random() > 0.4;

            return (
              <rect
                key={`bar-${i}`}
                x={barcodePaddingX + i * barWidth - (isWide ? barWidth * 0.1 : 0)}
                y={barcodePaddingY}
                width={width}
                height={barcodeHeight}
                fill={isFilled ? '#333' : 'white'}
              />
            );
          })}
        </g>

        {/* 스캔 라인 (좌에서 우로) */}
        <line
          x1={barcodePaddingX}
          y1={barcodePaddingY}
          x2={barcodePaddingX}
          y2={barcodePaddingY + barcodeHeight}
          stroke="url(#scanLineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          className="barcode-scan-line"
        />

        {/* 좌측 포커스 마커 */}
        <g style={{ animationDelay: '0s' }}>
          <circle
            cx={barcodePaddingX - 6}
            cy={barcodePaddingY - 8}
            r="3"
            fill="#FF3333"
            opacity="0.7"
          />
          <circle
            cx={barcodePaddingX - 6}
            cy={barcodePaddingY + barcodeHeight + 8}
            r="3"
            fill="#FF3333"
            opacity="0.7"
          />
        </g>

        {/* 우측 포커스 마커 */}
        <g style={{ animationDelay: '0.5s' }}>
          <circle
            cx={barcodePaddingX + barcodeWidth + 6}
            cy={barcodePaddingY - 8}
            r="3"
            fill="#FF3333"
            opacity="0.7"
          />
          <circle
            cx={barcodePaddingX + barcodeWidth + 6}
            cy={barcodePaddingY + barcodeHeight + 8}
            r="3"
            fill="#FF3333"
            opacity="0.7"
          />
        </g>

        {/* 바코드 숫자 부분 */}
        <text
          x={barcodePaddingX + barcodeWidth / 2}
          y={barcodePaddingY + barcodeHeight + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#333"
          fontFamily="monospace"
          fontWeight="bold"
        >
          8809112370123
        </text>
      </svg>
    </div>
  );
}
