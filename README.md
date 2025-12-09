# git clone 후 꼭!!!!! npm ci 로 설치하기 npm install 금지!!!!


# 신규브랜치 - React Query를 이용한 API 캐싱과 MSW(Mock Service Worker)를 활용한 개발 환경 API Mock 처리를 사용함에 따라 아래와 같은 방법 필요

eact-query와 MSW는 이미 프로젝트에 의존성으로 포함돼 있습니다.
frontend 폴더에서 npm install만 실행하면 바로 실행 가능합니다.

만약 MSW 관련 에러가 발생할 경우,
아래 명령을 한 번만 실행해 주세요.

npx msw init public/

--만약 안 될 시 ? 아래 1~4 과정 필요

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


