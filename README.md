# 🥁 음성·제스처 기반 키오스크 주문 시스템 - Frontend

> React + TypeScript 기반의 대형 키오스크용 웹 애플리케이션  
> 음성 주문, 제스처 인식, 얼굴 분석, 타겟팅 광고를 지원하는 인터랙티브 주문 시스템

---

## 📋 Table of Contents

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [설치 및 실행](#설치-및-실행)
- [환경 설정](#환경-설정)
- [개발 가이드](#개발-가이드)
- [성능 최적화](#성능-최적화)

---

## 프로젝트 개요

**목표**: 얼굴 인식, 음성 인식, 제스처 감지를 기반으로 하는 스마트 키오스크 주문 시스템 제공

**주요 특징**:

- 🎤 **음성 주문**: Web Speech API를 통한 음성 인식 및 주문
- 👤 **얼굴 분석**: AI 기반 나이/성별 추정 및 타겟팅 광고
- 🎬 **광고 관리**: 타겟팅된 광고 자동 회전, 로컬 폴백 시스템
- 💳 **결제 시스템**: 카드, 모바일 결제 지원
- 🏃 **유휴 감시**: 60초 유휴 시 자동으로 광고 화면으로 전환
- 📊 **실시간 동기화**: SSE(Server-Sent Events) 기반 얼굴 인식 상태 감지

---

## 기술 스택

### Core

- **React 18.2** - UI 라이브러리
- **TypeScript 5.3** - 정적 타입 지원
- **Vite 5.0** - 빌드 도구 및 개발 서버
- **React Router 6.22** - 라우팅

### State & Data Fetching

- **Zustand 4.5** - 전역 상태 관리 (idle, cart, analysis)
- **TanStack React Query 5.90** - 서버 상태 관리 및 캐싱
- **Axios 1.6** - HTTP 클라이언트

### UI & Animation

- **Framer Motion 11.0** - 페이지 전환 및 컴포넌트 애니메이션
- **TailwindCSS 3.4** - 유틸리티 기반 스타일링
- **Lucide React 0.344** - 아이콘 라이브러리

### Development

- **MSW 2.12** - API Mock (개발 환경)
- **ESLint** - 코드 품질 검사
- **TypeScript** - 정적 타입 검사

---

## 프로젝트 구조

```
frontend/
├── public/                    # 정적 리소스
│   ├── images/
│   │   ├── ads/             # 광고 이미지 (로컬 폴백)
│   │   └── menu/            # 메뉴 카테고리 아이콘
│   └── raw/                 # 비디오/음성 파일
│
├── src/
│   ├── api/                 # API 클라이언트
│   │   ├── ApiClient.ts     # Axios 인스턴스 + 프록시 설정
│   │   ├── MenuApi.ts       # 메뉴/추천 API
│   │   ├── OrderApi.ts      # 주문 API
│   │   └── VoiceOrderApi.ts # 음성 주문 API
│   │
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── BottomCart.tsx           # 하단 장바구니
│   │   ├── MenuGrid.tsx             # 메뉴 그리드
│   │   ├── OptionsModal.tsx         # 옵션 선택 모달
│   │   ├── OrderConfirmModal.tsx    # 주문 확인 모달
│   │   ├── FaceAnalysisScreen.tsx   # 얼굴 인식 화면
│   │   ├── CustomCursor.tsx         # 커스텀 커서
│   │   ├── EasyMode/                # 일반 주문 UI
│   │   ├── VoiceMode/               # 음성 주문 UI
│   │   └── PayMent/                 # 결제 UI
│   │       ├── PaymentProgressModal.tsx   # 결제 진행 & 광고
│   │       ├── PaymentMethodPage.tsx      # 결제 수단 선택
│   │       └── *Animation.tsx             # 결제 애니메이션
│   │
│   ├── config/              # 설정 파일
│   │   └── ads.ts           # 로컬 광고 폴백 목록
│   │
│   ├── hooks/               # Custom Hooks
│   │   ├── UseMenu.ts             # 메뉴/추천 데이터 조회
│   │   ├── useAds.ts              # 광고 데이터 조회 & 캐싱
│   │   ├── useFaceDetection.ts    # 얼굴 인식 상태
│   │   ├── useIdleWatcher.ts      # 유휴 감시 (60초)
│   │   ├── UseRecorder.ts         # 음성 녹음
│   │   └── UseVoiceProcessor.ts   # 음성 처리 & STT
│   │
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Advertisement.tsx      # 전체 화면 광고 (9:16, 반응형)
│   │   ├── Order.tsx              # 일반 주문 페이지
│   │   ├── VoiceOrder.tsx         # 음성 주문 페이지
│   │   ├── EasyOrder.tsx          # 쉬운 주문 (큰 버튼)
│   │   ├── Payment.tsx            # 결제 페이지
│   │   └── EasyConfirm.tsx        # 쉬운 주문 확인
│   │
│   ├── store/               # Zustand 상태 저장소
│   │   ├── analysisStore.ts # 얼굴 분석 결과 (age, gender)
│   │   ├── idleStore.ts     # 유휴 상태 관리
│   │   └── UseCartStore.ts  # 장바구니 상태
│   │
│   ├── types/               # TypeScript 타입 정의
│   │   ├── index.ts         # 기본 타입
│   │   ├── ad.ts            # 광고 타입
│   │   ├── OrderTypes.ts    # 주문/추천 타입
│   │   ├── OptionTypes.ts   # 옵션 타입
│   │   └── VoiceOrderTypes.ts # 음성 주문 타입
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── adImpressionQueue.ts    # 광고 노출 로그 큐
│   │   ├── fetchLatestAnalysis.ts  # 분석 결과 조회
│   │   ├── format.ts               # 포맷팅 함수 (가격 등)
│   │   ├── localDateTime.ts        # 로컬 시간 포맷
│   │   ├── pricing.ts              # 가격 계산
│   │   └── voicehelpers.ts         # 음성 처리 헬퍼
│   │
│   ├── styles/              # 공유 스타일
│   │   └── designTokens.ts  # 디자인 토큰 (색상, 크기 등)
│   │
│   ├── App.tsx              # 루트 컴포넌트 (라우팅)
│   ├── App.css              # 전역 스타일
│   ├── index.css            # 리셋 스타일
│   └── main.tsx             # 진입점
│
├── .env.example             # 환경 변수 예제
├── vite.config.ts           # Vite 설정 (프록시)
├── tsconfig.json            # TypeScript 설정
├── tailwind.config.js       # TailwindCSS 설정
└── package.json             # 의존성 관리

```

---

## 주요 기능

### 1️⃣ 얼굴 인식 & 분석

- **FaceAnalysisScreen**: WebRTC 기반 카메라 피드로 이미지 캡처
- **분석 결과**: SSE(Server-Sent Events) 스트림으로 백엔드 분석 상태 실시간 감시
- **자동 전환**: 얼굴 인식 완료(`has_data=true`) 시 자동으로 주문 페이지로 전환
- **저장소**: `analysisStore.ts`에 age/gender 저장 (글로벌 상태)

```typescript
// 사용 예
const age = useAnalysisStore((s) => s.age);
const gender = useAnalysisStore((s) => s.gender);
const setAnalysis = useAnalysisStore((s) => s.setAnalysis);
```

### 2️⃣ 메뉴 조회 & 추천

- **`UseMenu.ts`**: 시간대별 기본 메뉴 + 타겟팅 추천 메뉴를 통합된 배열로 반환
- **메뉴 데이터**: API에서 조회 후 frontend에서 처리
- **추천 로직**: `analysisStore`의 age/gender를 기반으로 추천 메뉴 필터링
- **데이터 구조**: 추천 메뉴와 일반 메뉴를 `items` 배열에 통합해 반환
- **시간대 구분** (frontend에서 계산):
  - `6~11`: 아침 (조식)
  - `11~17`: 점심/오후
  - `17~22`: 저녁 (석식)

```typescript
const { items } = useMenu(gender, ageGroup); // 추천+일반 통합
```

### 3️⃣ 음성 주문

- **`UseRecorder.ts`**: MediaRecorder API로 음성 녹음 (브라우저 내 처리)
- **`UseVoiceProcessor.ts`**: Web Audio API로 음성 주파수 분석
- **음성 입력**: 메뉴명 자동 인식 → 장바구니 추가
- **피드백**: 인식된 메뉴명을 VoiceOrder 페이지에 표시
- **컴포넌트**: `VoiceMode/` 폴더의 UI 컴포넌트로 음성 모드 표현

### 4️⃣ 광고 시스템

- **`useAds.ts`**: TanStack React Query로 광고 리스트 조회 및 60초 캐싱
- **`Advertisement.tsx`**: 9:16 비율 전체 화면 광고 (10초마다 자동 회전)
- **반응형 스케일**: `BASE_WIDTH/HEIGHT` 기반으로 화면 크기에 자동 맞춤
- **타겟팅**: `analysisStore`의 age/gender 기반 광고 선택
- **로컬 폴백**: 네트워크 실패 시 `config/ads.ts`의 로컬 광고 이미지 사용
- **결제 완료 광고**: `PaymentProgressModal`에서 `aspect-[9/16]` 비율로 표시
- **노출 로그**: `adImpressionQueue.ts`로 로컬 큐에 저장 후 비동기 전송

```typescript
const { ads } = useAds(); // React Query로 자동 캐싱됨
```

### 5️⃣ 결제 시스템

- **`Payment.tsx`**: 결제 수단 선택 (카드, 모바일페이)
- **`PaymentProgressModal.tsx`**: 결제 진행 표시 + 주문번호 생성 + 광고
- **진행 단계**:
  1. 카드/QR/NFC 애니메이션 표시 (5초)
  2. "결제 완료" + 주문번호 표시
  3. 타겟팅된 광고 표시 (9:16 비율)
  4. 5초 카운트다운 후 주문 페이지로 복귀

### 6️⃣ 유휴 감시 & 광고 전환

- **`useIdleWatcher.ts`**: 마우스/터치/키보드 입력 감시
- **임계값**: 60초 유휴 시 `/advertisement`로 자동 이동
- **복귀**: 광고 클릭 또는 SSE 얼굴 인식 완료 시 주문 화면으로 복귀

### 7️⃣ 페이지 전환 애니메이션

- **`App.tsx`**: `AnimatePresence` + `mode="sync"` 사용
- **효과**: 페이지 전환 시 페이드 인/아웃 (겹침 효과로 플래시 최소화)
- **`Framer Motion`**: 자연스러운 페이지 전환

---

## 설치 및 실행

### 1️⃣ 준비

```bash
# 저장소 클론
git clone <repo-url>
cd frontend

# 의존성 설치 (npm ci 권장)
npm ci
# 또는
npm install
```

### 2️⃣ 개발 서버 실행

```bash
npm run dev
```

- 개발 서버: `http://localhost:5173`
- 프록시 설정: 모든 `/api/*` 요청은 `http://localhost:8080/nok-nok`로 포워딩됨

### 3️⃣ 빌드

```bash
npm run build
```

- 타입 체크 + Vite 번들링
- 출력: `dist/` 폴더

### 4️⃣ 미리보기

```bash
npm run preview
```

---

## 환경 설정

### `vite.config.ts` 프록시 설정

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080/nok-nok', // 백엔드 주소
      changeOrigin: true,
    },
  },
}
```

**주의**:

- 로컬 개발 시 백엔드 주소를 `http://localhost:8080/nok-nok`으로 설정
- 프로덕션 배포 시 실제 도메인으로 변경 필요
- 얼굴 분석 관련 SSE는 백엔드 API의 `/api/stream/status` 엔드포인트 사용

---

## 개발 가이드

### 상태 관리

#### Zustand 스토어

```typescript
// 분석 결과 (age, gender)
const { age, gender, setAnalysis } = useAnalysisStore();

// 유휴 상태
const { idle, markActive, setIdle } = useIdleStore();

// 장바구니
const { items, addItem, removeItem } = useCartStore();
```

#### React Query (서버 상태)

```typescript
// 메뉴 조회
const { data: items } = useQuery({
  queryKey: ['menus'],
  queryFn: MenuApi.getMenus,
  staleTime: 5 * 60 * 1000, // 5분
});

// 추천 메뉴
const { data: recommendedItems } = useQuery({
  queryKey: ['menus', 'recommend', age, gender],
  queryFn: () => MenuApi.getRecommendations({ age, gender }),
});
```

### API 호출

#### ApiClient 사용

```typescript
import { apiClient } from '@/api/ApiClient';

// GET
const { data } = await apiClient.get('/menus');

// POST
const { data } = await apiClient.post('/orders', { items: [...] });

// 에러 처리
try {
  await apiClient.post('/payment', paymentData);
} catch (error) {
  console.error('Payment failed:', error.response?.data);
}
```

### 커스텀 훅 만들기

```typescript
// hooks/useMyFeature.ts
import { useQuery } from '@tanstack/react-query';

export function useMyFeature(id: string) {
  return useQuery({
    queryKey: ['myFeature', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/my-feature/${id}`);
      return data;
    },
  });
}
```

### 음성 주문 흐름

```typescript
// 1. 음성 녹음 시작
const { startRecording, stopRecording } = useRecorder();

// 2. 음성 분석
const { recognizedText, isProcessing } = useVoiceProcessor();

// 3. 메뉴 매칭 후 장바구니 추가
const { addItem } = useCartStore();
```

### 광고 노출 로깅

```typescript
import { adImpressionQueue } from '@/utils/adImpressionQueue';

// 광고 노출 기록
adImpressionQueue.push({
  adId: ad.adId,
  displayedAt: new Date().toISOString(),
  displayDurationMs: 10000,
  ageGroup: analysis.ageGroup,
  gender: analysis.gender,
});

// 수동 플러시 (일반적으로 자동)
adImpressionQueue.flush();
```

---

## 성능 최적화

### 1. 데이터 캐싱

- **메뉴**: 5분 캐싱
- **광고**: 60초 캐싱
- **추천**: age/gender 변경 시에만 재조회

### 2. 이미지 최적화

- 광고 이미지: `preload` 속성으로 미리 로드
- 메뉴 이미지: Lazy loading 적용
- 로컬 폴백: WebP 대비 PNG 사용 (호환성)

### 3. 애니메이션 성능

- `will-change-transform` + `transform: translate3d()` 사용
- Framer Motion `initial`, `animate`, `exit` 최소화
- GPU 가속 활용

### 4. 번들 크기

- **Vite Code Splitting**: 페이지별 동적 import
- **Tree Shaking**: 미사용 코드 자동 제거
- **Lazy Components**: 광고 페이지는 필요할 때만 로드

```typescript
// App.tsx - lazy loading
const Advertisement = lazy(() => import('@/pages/Advertisement'));
const Order = lazy(() => import('@/pages/Order'));

export function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/advertisement" element={<Advertisement />} />
        <Route path="/order" element={<Order />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 트러블슈팅

### 광고가 안 보임

1. **로컬 광고 경로 확인**: `public/images/ads/` 폴더 확인
2. **백엔드 API 상태**: `GET /api/ads` 응답 확인
3. **캐시 클리어**: DevTools 캐시 또는 `npm run build`

### 음성 인식이 작동하지 않음

1. **브라우저 권한**: 마이크 접근 권한 확인
2. **SST 엔진**: 서버 음성 인식 API 상태 확인
3. **콘솔 에러**: 개발자 도구 Network 탭에서 요청 확인

### 추천메뉴가 안 나옴

1. **나이/성별 데이터**: `analysisStore`에 값이 있는지 확인
2. **시간대 매칭**: 현재 시간이 구간(`6~11` 등)에 포함되는지 확인
3. **API 응답**: `GET /api/menus/recommend?...` 응답 확인

### 페이지 깜빡임

- `AnimatePresence mode="sync"` 설정 확인
- 배경색 (`background: black`) 설정 확인

---

## 빌드 & 배포

### 프로덕션 빌드

```bash
npm run build
```

- TypeScript 타입 검사 → Vite 번들링
- 출력: `dist/` 폴더 (정적 파일)
- 브라우저 호환성: ES2020 이상

### 웹 서버 설정 (SPA 라우팅)

React Router를 사용하므로 모든 요청을 `index.html`로 라우팅해야 합니다.

**Nginx 예제**:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html; # dist 폴더 경로
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Apache 예제**:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_FILENAME} !-f
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [QSA,L]
</IfModule>
```

---

## 주요 코드 변경 사항

### ✅ 최근 업데이트

1. **추천메뉴 표시**: `UseMenu.ts`에서 추천 메뉴와 일반 메뉴를 `items`에 통합
2. **페이지 전환 부드러움**: `App.tsx`에서 `AnimatePresence mode="sync"` 적용
3. **광고 레이스 조건 해결**: `Advertisement.tsx`에서 `finalizedRef` 가드 추가
4. **Blackpink 로컬 광고**: `config/ads.ts`에서 파일 경로 수정 (공백 포함)
5. **결제 완료 광고 크기**: `PaymentProgressModal.tsx`에서 `aspect-[9/16]` + `max-w-lg` 적용

---

## 참고 링크

### 공식 문서

- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org)
- [React Router 공식 문서](https://reactrouter.com)
- [React Query (TanStack Query) 공식 문서](https://tanstack.com/query)
- [Zustand 공식 문서](https://github.com/pmndrs/zustand)
- [Framer Motion 공식 문서](https://www.framer.com/motion)
- [TailwindCSS 공식 문서](https://tailwindcss.com)
- [Vite 공식 문서](https://vitejs.dev)

### Web API 문서

- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [EventSource (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

---

## 라이선스

MIT License

---

## 기여자

이 프로젝트에 기여하고 싶으신가요? 풀 리퀘스트를 보내주세요!
