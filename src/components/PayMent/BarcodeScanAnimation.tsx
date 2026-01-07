interface BarcodeScanAnimationProps {
  size?: number;
  loop?: boolean;
  className?: string;
}

const EAN13_L: Record<string, string> = {
  '0': '0001101',
  '1': '0011001',
  '2': '0010011',
  '3': '0111101',
  '4': '0100011',
  '5': '0110001',
  '6': '0101111',
  '7': '0111011',
  '8': '0110111',
  '9': '0001011',
};

const EAN13_G: Record<string, string> = {
  '0': '0100111',
  '1': '0110011',
  '2': '0011011',
  '3': '0100001',
  '4': '0011101',
  '5': '0111001',
  '6': '0000101',
  '7': '0010001',
  '8': '0001001',
  '9': '0010111',
};

const EAN13_R: Record<string, string> = {
  '0': '1110010',
  '1': '1100110',
  '2': '1101100',
  '3': '1000010',
  '4': '1011100',
  '5': '1001110',
  '6': '1010000',
  '7': '1000100',
  '8': '1001000',
  '9': '1110100',
};

const EAN13_PARITY: Record<string, Array<'L' | 'G'>> = {
  '0': ['L', 'L', 'L', 'L', 'L', 'L'],
  '1': ['L', 'L', 'G', 'L', 'G', 'G'],
  '2': ['L', 'L', 'G', 'G', 'L', 'G'],
  '3': ['L', 'L', 'G', 'G', 'G', 'L'],
  '4': ['L', 'G', 'L', 'L', 'G', 'G'],
  '5': ['L', 'G', 'G', 'L', 'L', 'G'],
  '6': ['L', 'G', 'G', 'G', 'L', 'L'],
  '7': ['L', 'G', 'L', 'G', 'L', 'G'],
  '8': ['L', 'G', 'L', 'G', 'G', 'L'],
  '9': ['L', 'G', 'G', 'L', 'G', 'L'],
};

function toEan13Bits(rawCode: string) {
  const code = rawCode.replace(/\D/g, '');
  if (code.length !== 13) return null;
  const first = code[0];
  const left = code.slice(1, 7);
  const right = code.slice(7, 13);
  const parity = EAN13_PARITY[first];
  if (!parity) return null;

  let bits = '101';
  for (let i = 0; i < 6; i++) {
    const digit = left[i];
    const enc = parity[i] === 'G' ? EAN13_G[digit] : EAN13_L[digit];
    if (!enc) return null;
    bits += enc;
  }
  bits += '01010';
  for (let i = 0; i < 6; i++) {
    const digit = right[i];
    const enc = EAN13_R[digit];
    if (!enc) return null;
    bits += enc;
  }
  bits += '101';

  const quietZone = '00000000000';
  return {
    code,
    bits: `${quietZone}${bits}${quietZone}`,
  };
}

export default function BarcodeScanAnimation({
  size = 280,
  loop = true,
  className = '',
}: BarcodeScanAnimationProps) {
  const barcodeWidth = size * 0.7;
  const barcodeHeight = size * 0.34;
  const barcodePaddingX = (size - barcodeWidth) / 2;
  const barcodePaddingY = (size - barcodeHeight) / 2;

  const ean = toEan13Bits('8809112370123');
  const bits =
    ean?.bits ??
    '00000000000101000110110111001010101101100100100110100111010100111010101000001011101001110101000010101000000000000';
  const moduleWidth = barcodeWidth / bits.length;

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
            opacity: 0.15;
          }
          50% {
            opacity: 0.65;
          }
          100% {
            transform: translateX(${barcodeWidth}px);
            opacity: 0.15;
          }
        }

        .barcode-scan-line {
          animation: scanLineHorizontal 2.5s ease-in-out ${loop ? 'infinite' : '1'};
          transform-origin: left;
        }
      `}</style>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 바코드 배경 */}
        <rect
          x={barcodePaddingX}
          y={barcodePaddingY}
          width={barcodeWidth}
          height={barcodeHeight}
          fill="white"
          stroke="black"
          strokeWidth="2"
          rx="2"
        />

        {/* 바코드 패턴 (EAN-13 스타일, 흑/백만) */}
        <g>
          {Array.from(bits).map((bit, i) => {
            if (bit !== '1') return null;
            return (
              <rect
                key={`m-${i}`}
                x={barcodePaddingX + i * moduleWidth}
                y={barcodePaddingY}
                width={Math.max(0.8, moduleWidth)}
                height={barcodeHeight}
                fill="black"
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
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          className="barcode-scan-line"
        />

        {/* 바코드 숫자 부분 */}
        <text
          x={barcodePaddingX + barcodeWidth / 2}
          y={barcodePaddingY + barcodeHeight + 20}
          textAnchor="middle"
          fontSize="14"
          fill="black"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {ean?.code ?? '8809112370123'}
        </text>
      </svg>
    </div>
  );
}
