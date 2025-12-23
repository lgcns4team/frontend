// src/api/OrderApi.ts
import { apiClient } from './ApiClient';
import type { CreateOrderRequest, OrderResponse } from '../types/OrderTypes';

// 주문 생성 (결제 완료 후 호출)
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  // POST /api/orders 요청
  const res = await apiClient.post<OrderResponse>('/orders', orderData);
  
  // 결과 반환
  return res.data;
};