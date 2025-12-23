import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api', // Vite 프록시가 '/api'로 시작하는 요청을 8080으로 넘겨줍니다.
  headers: {
    'Content-Type': 'application/json',
  },
});