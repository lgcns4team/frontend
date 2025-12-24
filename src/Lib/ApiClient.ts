import axios from 'axios';

export const apiClient = axios.create({
  // 기본값은 '/api' (Vite dev proxy와 동일). 배포/실서버에서는 VITE_API_BASE_URL로 덮어쓸 수 있음.
  // 예) VITE_API_BASE_URL="https://your-backend.example.com/api"
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API ERROR:', err);
    return Promise.reject(err);
  }
);
