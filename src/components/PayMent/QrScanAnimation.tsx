interface QrScanAnimationProps {
  size?: number;
  loop?: boolean;
  className?: string;
}

export default function QrScanAnimation({
  size = 320,
  loop = true,
  className = '',
}: QrScanAnimationProps) {
  const qrCodeSize = size * 0.28;
  const phoneWidth = size * 0.5;
  const phoneHeight = size * 0.85;
  const spacing = size * 0.08;

  const qrX = (size - qrCodeSize - spacing - phoneWidth) / 2;
  const qrY = (size - qrCodeSize) / 2;
  const phoneX = qrX + qrCodeSize + spacing;
  const phoneY = (size - phoneHeight) / 2;

  const screenPadding = phoneWidth * 0.08;
  const screenWidth = phoneWidth - screenPadding * 2;
  const screenHeight = phoneHeight * 0.62;
  const smallQrSize = screenWidth * 0.75;
  const smallQrX = (screenWidth - smallQrSize) / 2;
  const smallQrY = (screenHeight - smallQrSize) / 2;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="QR 코드 스캔 중"
      role="img"
    >
      <style>{`
        @keyframes buttonPulse {
          0%, 100% { 
            opacity: 0.85; 
            transform: scale(1) translateY(0);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.04) translateY(-3px);
          }
        }

        @keyframes phoneSway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(2px); }
        }

        @keyframes buttonGlow {
          0%, 100% { 
            filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.2));
          }
          50% { 
            filter: drop-shadow(0 8px 16px rgba(16, 185, 129, 0.4));
          }
        }

        .button-pulse {
          animation: buttonPulse 1.4s ease-in-out ${loop ? 'infinite' : '1'};
        }

        .phone-sway {
          animation: phoneSway 3s ease-in-out ${loop ? 'infinite' : '1'};
        }

        .button-glow {
          animation: buttonGlow 1.4s ease-in-out ${loop ? 'infinite' : '1'};
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
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ===== 좌측 QR 코드 ===== */}
        {/* QR 코드 외부 글로우 */}
        <rect
          x={qrX - 6}
          y={qrY - 6}
          width={qrCodeSize + 12}
          height={qrCodeSize + 12}
          fill="none"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth="2"
          rx="10"
          className="glow-aura"
        />

        {/* QR 코드 배경 */}
        <rect
          x={qrX}
          y={qrY}
          width={qrCodeSize}
          height={qrCodeSize}
          fill="white"
          stroke="#BFDBFE"
          strokeWidth="2"
          rx="8"
          className="qr-pulse"
          filter="url(#softGlow)"
        />

        {/* QR 코드 격자 패턴 (21x21) */}
        {Array.from({ length: 21 }).map((_, i) =>
          Array.from({ length: 21 }).map((_, j) => {
            const cellSize = qrCodeSize / 21;

            // 위치 표시자
            const isTopLeftMarker = i < 7 && j < 7;
            const isTopRightMarker = i < 7 && j >= 14;
            const isBottomLeftMarker = i >= 14 && j < 7;

            const isMarkerBorder =
              (isTopLeftMarker && (i === 6 || j === 6)) ||
              (isTopRightMarker && (i === 6 || j === 14)) ||
              (isBottomLeftMarker && (i === 14 || j === 6));

            const isMarkerInner =
              (isTopLeftMarker || isTopRightMarker || isBottomLeftMarker) &&
              !isMarkerBorder &&
              !(
                (isTopLeftMarker && i === 5 && j === 5) ||
                (isTopLeftMarker && i < 5 && j < 5 && (i === 1 || j === 1 || i === 3 || j === 3)) ||
                (isTopRightMarker && i === 5 && j === 15) ||
                (isTopRightMarker &&
                  i < 5 &&
                  j >= 15 &&
                  (i === 1 || j === 19 || i === 3 || j === 17)) ||
                (isBottomLeftMarker && i === 15 && j === 5) ||
                (isBottomLeftMarker &&
                  i >= 15 &&
                  j < 5 &&
                  (i === 19 || j === 1 || i === 17 || j === 3))
              );

            const isTimingLine = (i === 6 || j === 6) && !isMarkerInner && !isMarkerBorder;

            let isFilled = false;
            if (!isMarkerInner && !isMarkerBorder && !isTimingLine) {
              if ((i < 5 && j < 5) || (i < 5 && j > 15) || (i > 15 && j < 5)) {
                isFilled = true;
              } else {
                isFilled = Math.random() > 0.5;
              }
            }

            return (
              <rect
                key={`qr-cell-${i}-${j}`}
                x={qrX + j * cellSize}
                y={qrY + i * cellSize}
                width={cellSize - 0.3}
                height={cellSize - 0.3}
                fill={isMarkerBorder ? 'white' : isMarkerInner || isFilled ? '#333' : 'white'}
              />
            );
          })
        )}

        {/* QR 코드 스캔 라인 (좌→우) */}
        <line
          x1={qrX + 8}
          y1={qrY + 8}
          x2={qrX + 8}
          y2={qrY + qrCodeSize - 8}
          stroke="url(#scanGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="qr-scan-line"
        />

        {/* QR 코드 코너 마커 */}
        {/* 좌상단 */}
        <g className="corner-marker">
          <line
            x1={qrX - 4}
            y1={qrY}
            x2={qrX - 4}
            y2={qrY + 12}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={qrX}
            y1={qrY - 4}
            x2={qrX + 12}
            y2={qrY - 4}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* 우상단 */}
        <g className="corner-marker" style={{ animationDelay: '0.5s' }}>
          <line
            x1={qrX + qrCodeSize + 4}
            y1={qrY}
            x2={qrX + qrCodeSize + 4}
            y2={qrY + 12}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={qrX + qrCodeSize}
            y1={qrY - 4}
            x2={qrX + qrCodeSize - 12}
            y2={qrY - 4}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* 좌하단 */}
        <g className="corner-marker" style={{ animationDelay: '1s' }}>
          <line
            x1={qrX - 4}
            y1={qrY + qrCodeSize}
            x2={qrX - 4}
            y2={qrY + qrCodeSize - 12}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={qrX}
            y1={qrY + qrCodeSize + 4}
            x2={qrX + 12}
            y2={qrY + qrCodeSize + 4}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* 우하단 */}
        <g className="corner-marker" style={{ animationDelay: '1.5s' }}>
          <line
            x1={qrX + qrCodeSize + 4}
            y1={qrY + qrCodeSize}
            x2={qrX + qrCodeSize + 4}
            y2={qrY + qrCodeSize - 12}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={qrX + qrCodeSize}
            y1={qrY + qrCodeSize + 4}
            x2={qrX + qrCodeSize - 12}
            y2={qrY + qrCodeSize + 4}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* 우측 핸드폰 ===== */}
        {/* 핸드폰 그림자 */}
        <rect
          x={phoneX + 4}
          y={phoneY + 4}
          width={phoneWidth}
          height={phoneHeight}
          rx="16"
          fill="rgba(0, 0, 0, 0.15)"
          filter="blur(4px)"
        />

        {/* 핸드폰 본체 */}
        <rect
          x={phoneX}
          y={phoneY}
          width={phoneWidth}
          height={phoneHeight}
          rx="16"
          fill="url(#phoneGradient)"
          stroke="#1E3A8A"
          strokeWidth="2"
          className="phone-sway"
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
          x={phoneX + screenPadding}
          y={phoneY + 30}
          width={screenWidth}
          height={screenHeight}
          rx="8"
          fill="#E3F2FD"
          stroke="#90CAF9"
          strokeWidth="1"
        />

        {/* 핸드폰 화면 내 QR 코드 */}
        <rect
          x={phoneX + screenPadding + smallQrX}
          y={phoneY + 30 + smallQrY}
          width={smallQrSize}
          height={smallQrSize}
          fill="white"
          stroke="#BFDBFE"
          strokeWidth="1"
          rx="2"
        />

        {/* 작은 QR 코드 격자 (간단히) */}
        {Array.from({ length: 15 }).map((_, i) =>
          Array.from({ length: 15 }).map((_, j) => {
            const cellSize = smallQrSize / 15;
            const isCorner = (i < 4 && j < 4) || (i < 4 && j > 10) || (i > 10 && j < 4);

            return (
              <rect
                key={`small-qr-${i}-${j}`}
                x={phoneX + screenPadding + smallQrX + j * cellSize}
                y={phoneY + 30 + smallQrY + i * cellSize}
                width={cellSize - 0.2}
                height={cellSize - 0.2}
                fill={isCorner ? '#333' : Math.random() > 0.6 ? '#333' : 'white'}
              />
            );
          })
        )}

        {/* 초록색 버튼 */}
        <rect
          x={phoneX + screenPadding}
          y={phoneY + 30 + screenHeight + 12}
          width={screenWidth}
          height={phoneHeight * 0.15}
          rx="6"
          fill="#10B981"
          stroke="#059669"
          strokeWidth="1.5"
          filter="url(#softGlow)"
        />

        {/* 버튼 그림자 */}
        <rect
          x={phoneX + screenPadding}
          y={phoneY + 30 + screenHeight + 13}
          width={screenWidth}
          height={phoneHeight * 0.15}
          rx="6"
          fill="rgba(0, 0, 0, 0.1)"
          filter="blur(3px)"
        />

        {/* 버튼 텍스트 */}
        <text
          x={phoneX + phoneWidth / 2}
          y={phoneY + 30 + screenHeight + 12 + (phoneHeight * 0.15) / 2 + 5}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="white"
          letterSpacing="2"
        >
          SCAN QR
        </text>

        {/* 연결선 (QR ↔ Phone) */}
        <line
          x1={qrX + qrCodeSize}
          y1={size / 2}
          x2={phoneX}
          y2={size / 2}
          stroke="#3B82F6"
          strokeWidth="1.5"
          opacity="0.4"
          strokeDasharray="5,5"
        />
      </svg>
    </div>
  );
}
