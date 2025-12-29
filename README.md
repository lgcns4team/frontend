# git clone 후 꼭!!!!! npm ci 로 설치하기 npm install 금지!!!!


# 신규브랜치 - React Query를 이용한 API 캐싱과 MSW(Mock Service Worker)를 활용한 개발 환경 API Mock 처리를 사용함에 따라 아래 1~4 방법 필요

1. 의존성 설치
npm install
2. react-query 설치 여부 확인
npm ls @tanstack/react-query
없으면
npm install @tanstack/react-query

3. MSW 설치 여부 확인
npm ls msw
없으면
npm install -D msw

4. Service Worker 파일 존재 여부 확인
ls public/mockServiceWorker.js
없으면 (최초 1회)
npx msw init public/


---

## FaceAnalysisScreen (ai-core / DeepFace 기반)

얼굴(대상) 인식/나이·성별 추정은 프론트가 아니라 `ai-core`(FastAPI + DeepFace)에서 수행합니다.
프론트의 FaceAnalysisScreen은 아래 API를 호출해 상태를 표시하고 결과를 가져옵니다.

- SSE 상태 스트림: `GET /api/stream/status`
- 상태 조회: `GET /api/status`
- 결과 조회: `GET /api/analysis`
- 결과 초기화: `DELETE /api/analysis`

### 환경변수

기본 ai-core 주소는 `http://127.0.0.1:8000` 입니다.

- `VITE_AI_CORE_URL=http://127.0.0.1:8000`

### 실행 흐름

1) `ai-core` 서버를 먼저 실행
2) 프론트 실행 후 FaceAnalysisScreen 진입
3) 백엔드에서 `has_data=true`가 되면 프론트가 `/api/analysis`를 자동 조회


