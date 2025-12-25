// src/api/OrderApi.ts
import { apiClient } from './ApiClient';
import type { CreateOrderRequest, OrderResponse } from '../types/OrderTypes';

// 주문 생성 함수
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  // POST 요청으로 주문 데이터를 보냅니다.
  const response = await apiClient.post<OrderResponse>('/orders', orderData);
  return response.data;
};

// [신규] 주문 검증 (결제 전 호출)
// 백엔드가 계산한 총액(totalAmount)을 리턴한다고 가정합니다.
export const verifyOrder = async (orderData: CreateOrderRequest): Promise<{ totalAmount: number; valid: boolean }> => {
  // 주소는 백엔드 명세에 따라 '/orders/verify' 또는 '/orders/calculation' 등으로 수정 필요
  const res = await apiClient.post<{ totalAmount: number; valid: boolean }>('/orders/validate', orderData);
  return res.data;
};