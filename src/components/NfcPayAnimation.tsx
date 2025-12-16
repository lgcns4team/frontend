interface NfcPayAnimationProps {
  size?: number;
  loop?: boolean;
  className?: string;
}

export default function NfcPayAnimation({
  size = 320,
  loop = true,
  className = '',
}: NfcPayAnimationProps) {
  const phoneWidth = size * 0.35;
  const phoneHeight = size * 0.7;
  const readerWidth = size * 0.35;
  const readerHeight = size * 0.6;
  const spacing = size * 0.15;

  const phoneX = (size - phoneWidth - spacing - readerWidth) / 2;
  const phoneY = (size - phoneHeight) / 2;
  const readerX = phoneX + phoneWidth + spacing;
  const readerY = (size - readerHeight) / 2;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="NFC 결제 중"
      role="img"
    >
      <style>{`
        @keyframes nfcWave {
          0% {
            r: 8px;
            opacity: 0.8;
          }
          50% {
            r: 20px;
            opacity: 0.4;
          }
          100% {
            r: 32px;
            opacity: 0;
          }
        }

        @keyframes cardSlide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .nfc-wave {
          animation: nfcWave 1.5s ease-out ${loop ? 'infinite' : '1'};
        }

        .card-animation {
          animation: cardSlide 1.5s ease-in-out ${loop ? 'infinite' : '1'};
        }
      `}</style>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="readerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#6B7280" />
          </linearGradient>
        </defs>

        {/* ===== 좌측 핸드폰 ===== */}
        {/* 핸드폰 본체 */}
        <rect
          x={phoneX}
          y={phoneY}
          width={phoneWidth}
          height={phoneHeight}
          rx="16"
          fill="url(#phoneGradient)"
          stroke="#1E40AF"
          strokeWidth="2"
        />

        {/* 핸드폰 노치 */}
        <rect
          x={phoneX + phoneWidth / 2 - 25}
          y={phoneY + 8}
          width="50"
          height="12"
          rx="6"
          fill="#0D47A1"
        />

        {/* 핸드폰 화면 */}
        <rect
          x={phoneX + 12}
          y={phoneY + 28}
          width={phoneWidth - 24}
          height={phoneHeight - 50}
          rx="8"
          fill="#E3F2FD"
          stroke="#90CAF9"
          strokeWidth="1"
        />

        {/* 카드 애니메이션 */}
        <g className="card-animation">
          {/* 카드 */}
          <rect
            x={phoneX + 20}
            y={phoneY + 45}
            width={phoneWidth - 40}
            height={phoneHeight * 0.35}
            rx="6"
            fill="#1E40AF"
            stroke="#0D47A1"
            strokeWidth="1"
          />

          {/* 카드 칩 */}
          <rect x={phoneX + 30} y={phoneY + 60} width="20" height="20" rx="2" fill="#FFD700" />
          <rect x={phoneX + 32} y={phoneY + 62} width="16" height="16" rx="1" fill="#DAA520" />

          {/* 카드 텍스트 */}
          <text
            x={phoneX + phoneWidth / 2}
            y={phoneY + 95}
            textAnchor="middle"
            fontSize="12"
            fill="white"
            fontWeight="bold"
          >
            Credit Card
          </text>
        </g>

        {/* ===== 우측 리더기 (POS) ===== */}
        {/* 리더기 본체 */}
        <rect
          x={readerX}
          y={readerY}
          width={readerWidth}
          height={readerHeight}
          rx="12"
          fill="url(#readerGradient)"
          stroke="#4B5563"
          strokeWidth="2"
        />

        {/* 리더기 상단 */}
        <rect
          x={readerX + 10}
          y={readerY + 15}
          width={readerWidth - 20}
          height={readerHeight * 0.3}
          rx="8"
          fill="#6B7280"
          stroke="#4B5563"
          strokeWidth="1"
        />

        {/* SMART PAY 텍스트 */}
        <text
          x={readerX + readerWidth / 2}
          y={readerY + 35}
          textAnchor="middle"
          fontSize="14"
          fill="white"
          fontWeight="bold"
          letterSpacing="2"
        >
          SMART
        </text>
        <text
          x={readerX + readerWidth / 2}
          y={readerY + 52}
          textAnchor="middle"
          fontSize="14"
          fill="white"
          fontWeight="bold"
          letterSpacing="2"
        >
          PAY
        </text>

        {/* 리더기 표시 부분 */}
        <rect
          x={readerX + 15}
          y={readerY + 60}
          width={readerWidth - 30}
          height="3"
          fill="#9CA3AF"
          rx="1"
        />
        <rect
          x={readerX + 15}
          y={readerY + 68}
          width={readerWidth - 30}
          height="3"
          fill="#9CA3AF"
          rx="1"
        />

        {/* NFC 심볼 (파동) */}
        <g>
          <circle
            cx={readerX + readerWidth / 2}
            cy={readerY + readerHeight - 40}
            r="6"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <path
            d={`M ${readerX + readerWidth / 2 - 12} ${readerY + readerHeight - 40} Q ${
              readerX + readerWidth / 2 - 12
            } ${readerY + readerHeight - 52} ${readerX + readerWidth / 2} ${
              readerY + readerHeight - 52
            }`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <path
            d={`M ${readerX + readerWidth / 2 + 12} ${readerY + readerHeight - 40} Q ${
              readerX + readerWidth / 2 + 12
            } ${readerY + readerHeight - 52} ${readerX + readerWidth / 2} ${
              readerY + readerHeight - 52
            }`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        </g>

        {/* ===== 중앙 NFC 파장 애니메이션 ===== */}
        {/* 첫번째 파장 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          opacity="0.8"
          className="nfc-wave"
        />

        {/* 두번째 파장 (지연) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="2"
          opacity="0.8"
          className="nfc-wave"
          style={{ animationDelay: '0.5s' }}
        />

        {/* 세번째 파장 (더 많은 지연) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="2"
          opacity="0.8"
          className="nfc-wave"
          style={{ animationDelay: '1s' }}
        />

        {/* 중앙 연결선 */}
        <line
          x1={phoneX + phoneWidth - 5}
          y1={size / 2}
          x2={readerX + 5}
          y2={size / 2}
          stroke="#3B82F6"
          strokeWidth="1.5"
          opacity="0.5"
          strokeDasharray="5,5"
        />
      </svg>
    </div>
  );
}
