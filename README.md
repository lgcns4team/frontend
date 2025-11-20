🍔 AI Smart Kiosk (Frontend)

이 프로젝트는 React 18과 Vite 5를 기반으로 구축된 스마트 키오스크 애플리케이션입니다.
음성 주문(STT), 얼굴 인식(Vision), 실시간 통신 기능을 포함합니다.

⚠️ 중요: 버전 관리 정책 (Version Policy)

프로젝트의 안정성과 모든 팀원의 개발 환경 통일을 위해 아래 명시된 버전을 엄격히 준수합니다.
패키지 설치 시 반드시 --save-exact 옵션을 사용하여 버전을 고정해 주세요.

Tech

Version (Fixed)

Description

Node.js

20.x (LTS)

실행 환경 (필수)

Vite

5.x

빌드 도구

React

18.x

UI 라이브러리

TypeScript

5.x

정적 타입 언어

Router

6.x

react-router-dom

Styling

3.x

tailwindcss

HTTP

1.x

axios

🚀 시작 가이드 (Getting Started)

1. 환경 설정

이 프로젝트는 Node.js v20 환경에서 최적화되어 있습니다.

node -v
# v20.x.x 버전인지 확인하세요.


2. 프로젝트 복제 및 설치

package-lock.json에 기록된 정확한 버전을 설치하기 위해 npm install 대신 npm ci 사용을 권장합니다.

# 레포지토리 클론
git clone [레포지토리 URL]
cd kiosk-app

# 의존성 설치 (버전 엄수)
npm ci
# 또는 npm install


3. 개발 서버 실행

npm run dev


브라우저 접속: http://localhost:5173



🤝 협업 규칙 (Convention)

라이브러리 추가 시:

# 항상 버전을 명시하고 고정해서 설치하세요
npm install 패키지명@버전 --save-exact


코드 스타일:

컴포넌트 파일명은 PascalCase (예: OrderPage.tsx)

일반 함수/변수는 camelCase (예: handleOrder)

🖥️ 키오스크 모드 실행 (배포 시)

크롬 브라우저 속성에서 대상(Target) 뒤에 아래 옵션을 추가하여 실행합니다.
--kiosk --disable-pinch --overscroll-history-navigation=0
