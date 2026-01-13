export default function InsertCardAnimation() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <style>{`
        @keyframes cardInsert {
          0% {
            transform: translateY(150px);
            opacity: 1;
          }
          80% {
            transform: translateY(70px);
            opacity: 1;
          }
          100% {
            transform: translateY(70px);
            opacity: 0.8;
          }
        }
        
        .card-insert-animation {
          animation: cardInsert 3s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <div className="relative flex items-center justify-center w-64 h-96">
        <svg viewBox="0 0 240 400" className="w-full h-full">
          <defs>
            {/* 리더기 모양의 클립 패스 - 카드가 리더기 범위를 벗어나지 않도록 */}
            <clipPath id="readerClip">
              <rect x="30" y="50" width="180" height="200" rx="8" />
            </clipPath>
          </defs>

          {/* 카드 (세로, 애니메이션, 클립패스 적용) */}
          <g className="card-insert-animation" clipPath="url(#readerClip)">
            {/* 카드 본체 - 세로 */}
            <rect
              x="75"
              y="100"
              width="90"
              height="140"
              rx="6"
              fill="#FFB81C"
              stroke="#D4A500"
              strokeWidth="2"
            />

            {/* 카드 칩 */}
            <rect x="95" y="115" width="25" height="25" rx="3" fill="#FFD700" />
            <rect x="100" y="120" width="15" height="15" fill="#DAA520" />

            {/* 카드 번호 영역 */}
            <rect x="85" y="150" width="70" height="15" fill="#333" rx="2" />

            {/* 카드 홀더명 영역 */}
            <text x="120" y="180" fontSize="7" fill="#333" fontWeight="bold" textAnchor="middle">
              CARDHOLDER
            </text>

            {/* 카드 유효기간 */}
            <text x="95" y="205" fontSize="6" fill="#333">
              VALID THRU
            </text>
            <text x="115" y="205" fontSize="7" fill="#333" fontWeight="bold">
              12/26
            </text>
          </g>

          {/* 카드 리더기 (투입구 - 원래 위치, 카드 위에 표시) */}
          <g>
            {/* 리더기 본체 */}
            <rect
              x="30"
              y="165"
              width="180"
              height="65"
              rx="8"
              fill="#444"
              stroke="#222"
              strokeWidth="2"
            />

            {/* 리더기 상단 테두리 */}
            <rect x="30" y="165" width="180" height="15" rx="8" fill="#333" />

            {/* 투입구 슬릿 (세로) */}
            <rect x="100" y="175" width="40" height="15" rx="2" fill="#555" />

            {/* 투입구 내부 어둠 (세로) */}
            <rect x="105" y="177" width="30" height="11" fill="#1a1a1a" rx="1" />

            {/* 리더기 하단 */}
            <rect x="30" y="230" width="180" height="0" stroke="#666" strokeWidth="1" />

            {/* LED 인디케이터 */}
            <circle cx="160" cy="190" r="3.5" fill="#00AA00" opacity="0.8" />
            <circle cx="160" cy="190" r="3.5" fill="#00FF00" opacity="0.4" />

            {/* 리더기 텍스트 */}
            <text x="120" y="220" fontSize="10" fill="#888" textAnchor="middle" fontWeight="bold">
              카드 투입
            </text>
          </g>

          {/* 안내 텍스트 */}
        </svg>
      </div>

      <div className="text-center mt-4">
      <p className="text-2xl font-semibold text-gray-600">카드를 투입구에 천천히 밀어 넣어주세요</p>
      </div>
    </div>
  );
}
