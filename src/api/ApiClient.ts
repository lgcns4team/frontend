// src/api/ApiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  // [수정] 배포용 실제 도메인 주소로 변경
  baseURL: 'https://api.bfree-kiosk.com/nok-nok', 
  headers: {
    'Content-Type': 'application/json',
  },
});