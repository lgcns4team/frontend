/**
 * 키오스크 UI 디자인 시스템 - 공통 토큰
 * Order와 VoiceOrder 화면의 일관된 스타일 기준
 */

// ===== TYPOGRAPHY =====
export const TEXT_STYLES = {
  // 헤더
  header: 'text-2xl font-extrabold text-gray-900', // NOK NOK 로고

  // 네비게이션 버튼
  navButton: 'font-bold text-lg', // 음성주문, 쉬운주문 버튼 텍스트

  // 카테고리 버튼
  categoryButton: 'font-bold text-lg',

  // 메뉴 카드
  menuCardTitle: 'font-bold text-lg',
  menuCardPrice: 'text-sm',

  // 안내 텍스트
  guideText: 'font-extrabold text-2xl whitespace-pre-wrap leading-snug',

  // 일반 텍스트
  bodyText: 'text-base',
};

// ===== SPACING =====
export const SPACING = {
  // 헤더 & 네비
  headerPadding: 'px-6 py-4',
  navSectionPadding: 'px-4 py-3',
  navGap: 'gap-3',

  // 버튼 내부 패딩
  navButtonPadding: 'p-3',
  categoryButtonPadding: 'px-6 py-3',

  // 메인 콘텐츠
  mainPadding: 'p-4',
  mainGap: 'gap-3',

  // 카드 & 컨테이너
  cardPadding: 'p-4',
  panelPadding: 'p-6',

  // 하단 바
  bottomBarPaddingX: 'px-8',
  bottomBarPaddingY: 'py-4',
};

// ===== BORDERS & CORNERS =====
export const BORDERS = {
  // 버튼 & 카드
  buttonRadius: 'rounded-xl',
  largeRadius: 'rounded-2xl',
  pillRadius: 'rounded-full',

  // 테두리
  buttonBorder: 'border',
  noBorder: 'border-none',
};

// ===== SIZES =====
export const SIZES = {
  // 메뉴 그리드
  menuGridCols: 'grid-cols-3',
  menuCardHeight: 'h-20',

  // 아이콘
  smallIcon: 'w-6 h-6',
  mediumIcon: 'w-8 h-8',
  largeIcon: 'w-12 h-12',
};

// ===== COLORS =====
export const COLORS = {
  // 배경
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gray-50',
  bgTertiary: 'bg-gray-100',

  // 텍스트
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-500',
  textMuted: 'text-gray-400',

  // 상태별 색상
  primary: {
    bg: 'bg-gray-900',
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-900',
    border: 'border-pink-100',
    hover: 'hover:bg-pink-100 hover:border-pink-200',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-100',
    hover: 'hover:bg-orange-100 hover:border-orange-200',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    hover: 'hover:bg-blue-50',
  },
};

// ===== COMPOSITE STYLES =====
export const BUTTON_STYLES = {
  // 네비게이션 버튼 기본
  navBase: `${SPACING.navButtonPadding} ${BORDERS.buttonRadius} ${BORDERS.buttonBorder} flex items-center gap-2 justify-center transition-colors active:scale-95`,

  // 카테고리 버튼
  category: `${SPACING.categoryButtonPadding} ${BORDERS.pillRadius} ${TEXT_STYLES.categoryButton} transition-colors`,
  categoryActive: 'bg-gray-900 text-white',
  categoryInactive: 'bg-gray-100 text-gray-500',
};

export const CARD_STYLES = {
  // 메뉴 카드
  menuCard: `bg-white border border-gray-200 ${BORDERS.buttonRadius} ${SPACING.cardPadding} shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1 active:scale-95`,

  // 일반 카드/패널
  panel: `${COLORS.bgPrimary} ${BORDERS.buttonBorder} shadow-sm`,
};

export const LAYOUT_STYLES = {
  // 메인 컨테이너
  mainContainer: 'flex-1 overflow-y-auto p-4 bg-gray-50 no-scrollbar',

  // 그리드
  menuGrid: 'grid grid-cols-3 gap-3 pb-4',
};

// ===== ANIMATIONS =====
export const ANIMATIONS = {
  transition: 'transition-colors',
  transitionAll: 'transition-all',
  hoverEffect: 'hover:opacity-90',
};
