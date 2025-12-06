export type MenuItem = {
    id: number;
    name: string;
    price: number;
    category: string;
    img: string;
  };
  
  export type Options = {
    temperature: "hot" | "cold";
    whip: boolean;
    shot: number;
    size: "tall" | "grande" | "venti"; // string에서 구체화
    ice: "less" | "normal" | "more"; // string에서 구체화
    isWeak?: boolean;
  };
  
  export type CartItem = MenuItem & {
    cartId: string;
    quantity: number;
    options?: Partial<Options>;
  };