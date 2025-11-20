🍔 AI Smart Kiosk (Frontend)음성 인식(STT)과 실시간 대화 기능이 탑재된 스마트 키오스크 프론트엔드 프로젝트입니다. > React 18과 Vite 5를 기반으로 구축되었으며, 엄격한 버전 관리를 통해 안정성을 보장합니다.🛠️ Tech Stack & Version Policy (중요)이 프로젝트는 팀원 간의 개발 환경 통일과 배포 안정성을 위해 아래 명시된 버전을 엄격히 준수합니다.라이브러리 추가 시 반드시 --save-exact 옵션을 사용하여 버전을 고정해 주세요.CategoryTechnologyVersion (Fixed)DescriptionRuntimeNode.js20.x (LTS)실행 환경 (필수)FrameworkReact18.xUI 라이브러리Build ToolVite5.x초고속 빌드 도구LanguageTypeScript5.x정적 타입 언어StylingTailwind CSS3.x유틸리티 퍼스트 CSSRoutingReact Router6.xSPA 라우팅HTTPAxios1.xAPI 통신RealtimeWebSocketNative실시간 주문/음성 데이터 전송✨ Key Features🗣️ AI 음성 주문 (Voice Ordering)사용자의 음성을 실시간으로 녹음하여 서버로 전송합니다.Whisper 모델을 활용한 정확한 메뉴 인식 및 의도 파악(주문/취소/결제).🛒 스마트 장바구니 (Smart Cart)음성 명령("아메리카노 담아줘", "라떼 취소해")에 따라 장바구니가 자동으로 업데이트됩니다.⚡ 실시간 반응 (Real-time Interaction)WebSocket을 통해 지연 시간 없는 즉각적인 피드백을 제공합니다.📱 키오스크 전용 UI (Kiosk Mode)터치 스크린에 최적화된 UX/UI 디자인.스크롤 방지 및 드래그 방지 등 키오스크 필수 스타일 적용.🚀 Getting Started로컬 개발 환경을 세팅하기 위해 다음 절차를 따라주세요.1. 사전 요구사항 (Prerequisites)반드시 Node.js v20 이상이 설치되어 있어야 합니다.node -v
# v20.x.x 버전인지 확인하세요.
2. 설치 (Installation)package-lock.json에 기록된 정확한 버전을 설치하기 위해 npm ci 사용을 권장합니다.# 레포지토리 복제
git clone [레포지토리 URL 입력]
cd kiosk-app

# 의존성 설치 (Clean Install)
npm ci
# 또는 npm install
3. 실행 (Run)개발 서버를 실행합니다.npm run dev
브라우저 주소창에 http://localhost:5173 을 입력하여 접속합니다.📂 Project Structure협업 시 파일 위치 혼동을 막기 위해 아래 디렉토리 구조를 따릅니다.src/
├── assets/          # 🖼️ 이미지, 폰트, 아이콘 리소스
├── components/      # 🧩 재사용 가능한 UI 컴포넌트 (Button, Modal, Card)
├── data/            # 📝 메뉴 데이터, 상수 모음 (menuData.ts)
├── hooks/           # 🎣 커스텀 훅 (useAudioRecorder, useWebSocket)
├── pages/           # 📄 페이지 단위 컴포넌트 (Intro, Order, Payment)
├── services/        # 🌐 API 통신 로직 (axios 설정, socket 연결)
├── store/           # 📦 전역 상태 관리 (Zustand/Context API)
├── utils/           # 🛠️ 유틸리티 함수 (포맷팅, 계산 등)
├── App.tsx          # 🚦 메인 라우팅 및 레이아웃 설정
└── main.tsx         # 🚪 애플리케이션 진입점
🤝 Contribution Guidelines라이브러리 설치 규칙# ❌ 잘못된 예 (버전 유동적)
npm install 라이브러리명

# ✅ 올바른 예 (버전 고정)
npm install 라이브러리명@버전 --save-exact
커밋 메시지 컨벤션feat: 새로운 기능 추가fix: 버그 수정style: 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음)refactor: 코드 리팩토링chore: 빌드 업무 수정, 패키지 매니저 설정 등🖥️ Deployment (Kiosk Mode)실제 키오스크 기기(Windows/Chrome OS)에서 배포 시, 크롬 브라우저를 아래 옵션으로 실행하여 전체 화면 모드를 활성화합니다.chrome.exe --kiosk "http://localhost:5173" --disable-pinch --overscroll-history-navigation=0

