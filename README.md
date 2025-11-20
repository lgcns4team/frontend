# 🍔 AI Smart Kiosk (Frontend)

> 대상인식과 실시간 대화 기능이 탑재된 스마트 키오스크 프론트엔드 프로젝트입니다.** <br/>
> React 18과 Vite 5를 기반으로 구축되었으며, 엄격한 버전 관리를 통해 안정성을 보장합니다.

---

## 🛠️ Tech Stack & Version Policy (중요)

이 프로젝트는 팀원 간의 개발 환경 통일과 배포 안정성을 위해 **아래 명시된 버전을 엄격히 준수**합니다.  
라이브러리 추가 시 반드시 `--save-exact` 옵션을 사용하여 버전을 고정해 주세요.

| Category | Technology | Version (Fixed) | Description |
| :--- | :--- | :--- | :--- |
| **Runtime** | **Node.js** | **20.x (LTS)** | 실행 환경 (필수) |
| **Framework** | React | 18.x | UI 라이브러리 |
| **Build Tool** | Vite | 5.x | 초고속 빌드 도구 |
| **Language** | TypeScript | 5.x | 정적 타입 언어 |
| **Styling** | Tailwind CSS | 3.x | 유틸리티 퍼스트 CSS |
| **Routing** | React Router | 6.x | SPA 라우팅 |
| **HTTP** | Axios | 1.x | API 통신 |
| **Realtime** | WebSocket | Native | 실시간 주문/음성 데이터 전송 |

---

## ✨ Key Features

* **🗣️ AI 음성 주문 (Voice Ordering)**
    * 사용자의 음성을 실시간으로 녹음하여 서버로 전송합니다.
    * Whisper 모델을 활용한 정확한 메뉴 인식 및 의도 파악(주문/취소/결제).
* **🛒 스마트 장바구니 (Smart Cart)**
    * 음성 명령("아메리카노 담아줘", "라떼 취소해")에 따라 장바구니가 자동으로 업데이트됩니다.
* **⚡ 실시간 반응 (Real-time Interaction)**
    * WebSocket을 통해 지연 시간 없는 즉각적인 피드백을 제공합니다.
* **📱 키오스크 전용 UI (Kiosk Mode)**
    * 터치 스크린에 최적화된 UX/UI 디자인.
    * 스크롤 방지 및 드래그 방지 등 키오스크 필수 스타일 적용.

---

## 🚀 Getting Started

로컬 개발 환경을 세팅하기 위해 다음 절차를 따라주세요.

### 1. 사전 요구사항 (Prerequisites)
반드시 **Node.js v20 이상**이 설치되어 있어야 합니다.
```bash
node -v
# v20.x.x 버전인지 확인하세요.

# 레포지토리 복제
git clone [레포지토리 URL 입력]
cd kiosk-app

# 의존성 설치 (Clean Install)
npm ci
# 또는 npm install
npm run dev

```

## 🤝 Contribution Guidelines
라이브러리 설치 규칙

* ** ❌ 잘못된 예 (버전 유동적) **
  * npm install 라이브러리명

* ** ✅ 올바른 예 (버전 고정) **
  * npm install 라이브러리명@버전 --save-exact

* ** 커밋 메시지 컨벤션 **

  * feat: 새로운 기능 추가

  * fix: 버그 수정

  * style: 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음)

  * refactor: 코드 리팩토링

  * chore: 빌드 업무 수정, 패키지 매니저 설정 등](url)

## 🖥️ Deployment (Kiosk Mode)
실제 키오스크 기기(Windows/Chrome OS)에서 배포 시, 크롬 브라우저를 아래 옵션으로 실행하여 전체 화면 모드를 활성화합니다.

```Bash

chrome.exe --kiosk "http://localhost:5173" --disable-pinch --overscroll-history-navigation=0

```

