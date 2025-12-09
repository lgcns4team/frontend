// src/utils/pricing.ts
import type { MenuItem, Options } from "../types";

/**
 * 메뉴의 기본 가격 + 옵션 가격(사이즈, 샷) * 수량을 계산합니다.
 */
export const calculateItemPrice = (
  item: MenuItem | null,
  options: Partial<Options>,
  quantity: number = 1
): number => {
  if (!item) return 0;

  let price = item.price;

  // 1. 사이즈 가격 조정
  if (options.size === "tall") price -= 500;
  if (options.size === "venti") price += 500;

  // 2. 샷 추가 가격 조정 (샷당 500원)
  if (options.shot && options.shot > 0) {
    price += options.shot * 500;
  }

  // 3. 수량 반영
  return price * quantity;
};