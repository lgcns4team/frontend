import axios from 'axios';
import { OrderResponse } from '../types/VoiceOrderTypes';

// [수정] 환경변수에서 주소를 가져오거나, 없으면 기본값 사용
// Vite에서는 import.meta.env를 사용합니다.
const API_URL = 'http://127.0.0.1:8000/order/voice';

export const sendAudioOrder = async (audioBlob: Blob): Promise<OrderResponse> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'order.webm');

  // 타임아웃 설정 
  const response = await axios.post<OrderResponse>(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15000 
  });

  return response.data;
};