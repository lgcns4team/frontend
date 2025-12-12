import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// MSW - 개발 환경에서만 실행
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./Mocks/browser');
    // MSW가 처리하지 않는 요청(이미지 등)은 무시하도록 'bypass' 옵션을 추가합니다.
    // 이렇게 하면 API 요청은 Mocking되고, 이미지 요청 등은 정상적으로 처리됩니다.
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
