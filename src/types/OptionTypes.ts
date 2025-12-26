
// src/types/OptionTypes.ts

// 1. 옵션 아이템 (개별 항목)
export interface BackendOptionItem {
  optionItemId: number;
  name: string;
  optionPrice: number;
}

// 2. 옵션 그룹 (사이즈, 샷 추가 등)
export interface BackendOptionGroup {
  optionGroupId: number;
  name: string;
  isRequired: boolean;       // true / false
  selectionType: 'SINGLE' | 'MULTI'; // "SINGLE" 또는 "MULTI"
  options: BackendOptionItem[];
}

// 3. API 응답 껍데기
export interface MenuOptionsResponse {
  menuId: number;
  menuName: string;
  basePrice: number;
  optionGroups: BackendOptionGroup[];
}