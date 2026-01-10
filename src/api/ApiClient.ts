import axios from 'axios';

//환경 변수에 따라 주소가 자동으로 바뀝니다.
export const apiClient = axios.create({
  // import.meta.env.VITE_API_URL : Vite가 .env 파일에서 값을 가져오는 문법입니다.
  baseURL: import.meta.env.VITE_API_URL || '/api', 
  // baseURL: 'https://api.bfree-kiosk.com/nok-nok/api',
  headers: {
    'Content-Type': 'application/json',
  },
});