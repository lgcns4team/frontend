import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080/nok-nok', // 백엔드 주소 확인
        changeOrigin: true,
        // 만약 백엔드 URL에 /api가 포함되지 않는다면 아래 주석을 해제하세요
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },

      // '/images': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      // },
    },
  },
});