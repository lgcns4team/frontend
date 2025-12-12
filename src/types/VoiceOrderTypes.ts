/* 
이 파일은 설계도 이자 약속입니다.
백앤드 서버와 프론트엔드 사이에 오가는 데이터가 어떻게 생겼는지 미리 정해놓는 곳입니다
타입스크립트의 장점이죠
*/



// 장바구니에 들어갈 아이템의 기본 데이터 (서버 응답 기준)
// interface: "객체는 이렇게 생겨야한다"라고 정의하는것 
// ?: "있을수도 있고 없을수도 있다"라는 뜻
export interface VoiceOrderItemData {
  id: string;           // 메뉴 고유 번호 (예: "menu_01")
  name: string;         // 메뉴명 (예: "아메리카노")  
  price: number;        // 가격 (예: 4000) 
  quantity: number;     // 수량 (예: 2)
  options?: string[];   // 선택된 옵션들 (예: ["샷추가", "바닐라시럽"])
  option_ids?: string[]; // 선택된 옵션들의 고유번호들 (예: ["opt_01", "opt_03"])
}

// extends OrderItem: OrderItem 의 속성들을 모두 포함 + 추가 속성들( OrderItem에 있는것 다복사하고, 아래있는것들을 더 추가함)
export interface CartItemData extends VoiceOrderItemData {
  _uid: string;       // 리액트가 화면을 그릴떄 필요한 고유키(중복없음 무조건)
  unitPrice: number;  // 개당 가격 (계산하기 편하려고 저장)
  totalPrice: number; // 총 가격 (화면에 바로 보여주려고 저장)
}

// 액션 타입 정의 (추가, 제거, 전체삭제) 다른 단어 예로 DELETE, UPDATE 등등 을 쓰면 타입스크립트가 에러를 냄
export type ActionType = 'ADD' | 'REMOVE' | 'CLEAR';

/*  
추가할때 : { type: 'ADD', data: { name : '아메리카노'....} } -> id 는 필요없어서 안보냄    
제거할때 : { type: 'REMOVE', id: 'menu_01', } -> data 도 필요없음  
전체삭제 : { type: 'CLEAR' }  -> id 도 data 도 필요없음
*/
export type OrderAction = 
  | { type: 'ADD'; data: VoiceOrderItemData }                     // ADD는 data 필수
  | { type: 'REMOVE'; id: string; data?: { quantity: number; mode?: string } } // REMOVE는 id 필수
  | { type: 'UPDATE'; targetId: string; data: VoiceOrderItemData }
  | { type: 'CLEAR' };                                   // CLEAR는 데이터 없음

// API 응답 타입
export interface OrderResponse {
  text: string;           // 음성인식 결과 텍스트
  actions: OrderAction[]; // 장바구니에 적용할 액션들
}