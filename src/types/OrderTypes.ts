export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  img: string;
};

export type Options = {
  temperature: "hot" | "cold";
  size: "tall" | "grande" | "venti";
  ice: "less" | "normal" | "more"; // 얼음 옵션
  shot: number;                    // 샷 개수
  whip: boolean;                   // 휘핑 여부
  isWeak: boolean;                 // 연하게 여부
};

export type CartItem = MenuItem & {
  cartId: string;
  quantity: number;
  options?: Partial<Options>;
};