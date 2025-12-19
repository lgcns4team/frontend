// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080/nok-nok/api', // 백엔드 서버 주소 (포트 확인 필요!)
        changeOrigin: true,
        // 만약 백엔드 주소가 /api를 포함하지 않는다면 아래 주석 해제
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})