// src/api/OrderApi.ts
import { apiClient } from './ApiClient';
import type { CreateOrderRequest, OrderResponse, OrderVerificationResponse } from '../types/OrderTypes';

// 주문 생성 함수
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  // POST 요청으로 주문 데이터를 보냅니다.
  const response = await apiClient.post<OrderResponse>('/api/orders', orderData);
  return response.data;
};

// 검증 함수 타입 적용
export const verifyOrder = async (orderData: CreateOrderRequest): Promise<OrderVerificationResponse> => {
  const response = await apiClient.post<OrderVerificationResponse>('/api/orders/validate', orderData);
  return response.data;
};