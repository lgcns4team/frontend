# git clone 후 꼭!!!!! npm ci 로 설치하기 npm install 금지!!!!

#신규브랜치 - React Query를 이용한 API 캐싱과 MSW(Mock Service Worker)를 활용한 개발 환경 API Mock 처리를 사용함에 따라 아래 1~4 과정 필요

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


