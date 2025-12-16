import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// MSW가 처리하지 않는 요청(이미지 등)은 무시하도록 설정합니다.
// 이 설정은 main.tsx 또는 앱의 진입점에서 호출될 수 있습니다.
// 만약 다른 곳에서 worker.start()를 호출한다면, 그곳에 이 옵션을 추가해야 합니다.
