import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api', // MSW가 가로채는 경로
  timeout: 5000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API ERROR:', err);
    return Promise.reject(err);
  }
);
