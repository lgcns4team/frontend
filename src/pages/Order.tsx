import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles, Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- 스타일: 스크롤바 숨기기 ---
const scrollbarHideClass =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

// --- 타입 정의 ---
type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  img: string;
};

// 주문 타입 (매장/포장/배달)
const ORDER_TYPES = ["매장", "포장"] as const;
type OrderType = (typeof ORDER_TYPES)[number];

// CartItem은 MenuItem에 quantity(수량) + 옵션 표시용 문자열 + cartId(고유키)가 추가된 형태
type CartItem = MenuItem & {
  quantity: number;
  optionLabel?: string;
  cartId: string;
};

// --- 데이터 ---
const CATEGORIES: string[] = ["추천메뉴", "커피", "음료", "디저트", "논카페인"];

const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "아메리카노",
    price: 2000,
    category: "커피",
    img: "/iced-americano.jpg",
  },
  {
    id: 2,
    name: "카페라떼",
    price: 3000,
    category: "커피",
    img: "/iced-latte.png",
  },
  {
    id: 3,
    name: "바닐라 라떼",
    price: 3500,
    category: "커피",
    img: "/vanilla-latte.png",
  },
  {
    id: 4,
    name: "카라멜 마키아또",
    price: 4000,
    category: "커피",
    img: "/caramel-macchiato.png",
  },
  {
    id: 5,
    name: "아포가토",
    price: 5000,
    category: "커피",
    img: "/caramel-macchiato.png",
  },
  {
    id: 6,
    name: "에스프레소",
    price: 1500,
    category: "커피",
    img: "/caramel-macchiato.png",
  },
  {
    id: 7,
    name: "복숭아 아이스티",
    price: 4000,
    category: "음료",
    img: "/caramel-macchiato.png",
  },
  {
    id: 8,
    name: "케모마일 티",
    price: 3000,
    category: "음료",
    img: "/caramel-macchiato.png",
  },
  {
    id: 9,
    name: "페퍼민트 티",
    price: 3000,
    category: "음료",
    img: "/caramel-macchiato.png",
  },
  {
    id: 10,
    name: "치즈 케이크",
    price: 6000,
    category: "디저트",
    img: "/caramel-macchiato.png",
  },
  {
    id: 11,
    name: "초코 라떼",
    price: 4000,
    category: "음료",
    img: "/caramel-macchiato.png",
  },
  {
    id: 12,
    name: "딸기 라떼",
    price: 4500,
    category: "음료",
    img: "/strawberry-milk.jpg",
  },
  {
    id: 13,
    name: "초코 케이크",
    price: 5000,
    category: "디저트",
    img: "/chocolate-cake-slice.png",
  },
  {
    id: 14,
    name: "무지개 케이크",
    price: 6500,
    category: "디저트",
    img: "/colorful-layered-cake.png",
  },
];

export default function GeneralOrder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 카테고리
  const [activeCategory, setActiveCategory] = useState<string>("추천메뉴");
  // 주문 타입 (매장/포장/배달) - 전체 주문 공통
  const [orderType, setOrderType] = useState<OrderType>("매장");
  // 장바구니
  const [cart, setCart] = useState<CartItem[]>([]);

  // 옵션 모달 관련 상태
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // 커피 온도
  const [coffeeTemp, setCoffeeTemp] = useState<"HOT" | "ICE">("ICE");
  // 티/음료 온도
  const [drinkTemp, setDrinkTemp] = useState<"HOT" | "ICE">("ICE");
  // 샷 추가 (모든 음료 공통)
  const [extraShot, setExtraShot] = useState(false);
  // 라떼류 휘핑 추가
  const [whippedCream, setWhippedCream] = useState(false);
  // 음료 얼음 양 (티 종류 제외)
  const [iceLevel, setIceLevel] = useState<"적게" | "보통" | "많이">("보통");

  const filteredItems =
    activeCategory === "추천메뉴"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  // 메뉴 클릭 시: 옵션 모달 열기
  const openOptionModal = (item: MenuItem) => {
    setSelectedItem(item);

    // 메뉴 클릭 시 옵션 초기화 (주문 타입은 유지)
    setCoffeeTemp("ICE");
    setDrinkTemp("ICE");
    setExtraShot(false);
    setWhippedCream(false);
    setIceLevel("보통");

    setOptionModalOpen(true);
  };

  // 장바구니 담기 (옵션까지 포함)
  const addToCart = (item: MenuItem, optionLabel?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.optionLabel === optionLabel
      );
      if (existing) {
        return prev.map((i) =>
          i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      const cartId = `${item.id}-${optionLabel ?? "default"}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      return [...prev, { ...item, quantity: 1, optionLabel, cartId }];
    });

    toast({
      description: `${item.name} 담겼습니다`,
      duration: 1000,
    });
  };

  // 모달에서 "담기" 버튼
  const handleConfirmOption = () => {
    if (!selectedItem) return;

    const optionParts: string[] = [];

    const isCoffee = selectedItem.category === "커피";
    const isDrink = selectedItem.category === "음료";
    const isLatte = selectedItem.name.includes("라떼");
    const isTeaName = selectedItem.name.includes("티"); // 복숭아 아이스티, 케모마일 티, 페퍼민트 티 등

    // 커피: HOT / ICE
    if (isCoffee) {
      optionParts.push(coffeeTemp === "HOT" ? "HOT" : "ICE");
    }

    // 음료: 티(이름에 '티')는 HOT/ICE
    if (isDrink && isTeaName) {
      optionParts.push(drinkTemp === "HOT" ? "HOT" : "ICE");
    }

    // 음료: 티가 아닌 음료만 얼음 양 선택
    if (isDrink && !isTeaName) {
      optionParts.push(`얼음 ${iceLevel}`);
    }

    // 모든 음료(커피 + 음료): 샷 추가
    if ((isCoffee || isDrink) && extraShot) {
      optionParts.push("샷 추가");
    }

    // 라떼류: 휘핑크림 추가
    if (isLatte && whippedCream) {
      optionParts.push("휘핑크림 추가");
    }

    const optionLabel =
      optionParts.length > 0 ? optionParts.join(" / ") : undefined;

    addToCart(selectedItem, optionLabel);
    setOptionModalOpen(false);
    setSelectedItem(null);
  };

  // 수량 변경 (cartId 기준으로 변경)
  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="relative w-[540px] h-[960px] mx-auto bg-gray-50 overflow-hidden flex flex-row shadow-2xl border border-gray-800 my-4 font-sans select-none">
      {/* --- [LEFT AREA] --- */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <div className="bg-white z-10 shadow-sm shrink-0">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-800">주문하기</h2>
            <div className="text-xs text-gray-500">{orderType} 주문</div>
          </div>

          {/* Categories */}
          <div
            className={`flex gap-2 overflow-x-auto p-3 ${scrollbarHideClass}`}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-3 rounded-full text-base font-bold transition-all border ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div
          className={`flex-1 overflow-y-auto p-4 ${scrollbarHideClass} pb-[280px]`}
        >
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => openOptionModal(item)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight break-keep">
                    {item.name}
                  </h3>
                  <p className="text-orange-600 font-bold text-lg mt-1">
                    {item.price.toLocaleString()}원
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 옵션 모달 */}
        {optionModalOpen && selectedItem && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-[420px] bg-white rounded-2xl shadow-2xl p-5"
            >
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                옵션 선택
              </h3>

              {/* 주문 방법 (매장 / 포장 / 배달) */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  이용 방법
                </div>
                <div className="flex bg-gray-100 rounded-full p-1">
                  {ORDER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 px-3 py-1 text-xs font-bold rounded-full transition-all ${
                        orderType === type
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택한 메뉴 정보 */}
              <div className="mb-4 border rounded-xl p-3 bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">
                    {selectedItem.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedItem.category}
                  </div>
                </div>
                <div className="text-orange-600 font-bold text-lg">
                  {selectedItem.price.toLocaleString()}원
                </div>
              </div>

              {/* 옵션 영역 */}
              {(() => {
                const isCoffee = selectedItem.category === "커피";
                const isDrink = selectedItem.category === "음료";
                const isLatte = selectedItem.name.includes("라떼");
                const isTeaName = selectedItem.name.includes("티");

                return (
                  <div className="space-y-4">
                    {/* 커피: HOT/ICE */}
                    {isCoffee && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          온도 선택
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCoffeeTemp("HOT")}
                            className={`flex-1 py-2 rounded-xl border text-sm font-bold ${
                              coffeeTemp === "HOT"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white text-gray-700 border-gray-200"
                            }`}
                          >
                            HOT
                          </button>
                          <button
                            onClick={() => setCoffeeTemp("ICE")}
                            className={`flex-1 py-2 rounded-xl border text-sm font-bold ${
                              coffeeTemp === "ICE"
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-200"
                            }`}
                          >
                            ICE
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 음료 + 티 이름: HOT/ICE */}
                    {isDrink && isTeaName && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          온도 선택
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDrinkTemp("HOT")}
                            className={`flex-1 py-2 rounded-xl border text-sm font-bold ${
                              drinkTemp === "HOT"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white text-gray-700 border-gray-200"
                            }`}
                          >
                            HOT
                          </button>
                          <button
                            onClick={() => setDrinkTemp("ICE")}
                            className={`flex-1 py-2 rounded-xl border text-sm font-bold ${
                              drinkTemp === "ICE"
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-200"
                            }`}
                          >
                            ICE
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 음료: 티가 아닌 음료만 얼음 양 선택 */}
                    {isDrink && !isTeaName && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          얼음 양
                        </div>
                        <div className="flex gap-2">
                          {["적게", "보통", "많이"].map((level) => (
                            <button
                              key={level}
                              onClick={() =>
                                setIceLevel(level as typeof iceLevel)
                              }
                              className={`flex-1 py-2 rounded-xl border text-sm font-bold ${
                                iceLevel === level
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              얼음 {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 모든 음료(커피 + 음료): 샷 추가 */}
                    {(isCoffee || isDrink) && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          추가 옵션
                        </div>
                        <button
                          onClick={() => setExtraShot((prev) => !prev)}
                          className={`w-full py-2 rounded-xl border text-sm font-bold flex items-center justify-between px-3 mb-2 ${
                            extraShot
                              ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span>샷 추가</span>
                          <span className="text-xs">
                            {extraShot ? "추가함" : "추가 안 함"}
                          </span>
                        </button>

                        {/* 라떼류: 휘핑크림 추가 */}
                        {isLatte && (
                          <button
                            onClick={() => setWhippedCream((prev) => !prev)}
                            className={`w-full py-2 rounded-xl border text-sm font-bold flex items-center justify-between px-3 ${
                              whippedCream
                                ? "bg-pink-100 border-pink-400 text-pink-800"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <span>휘핑크림 추가</span>
                            <span className="text-xs">
                              {whippedCream ? "추가함" : "추가 안 함"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 디저트 등: 옵션 없음 안내 */}
                    {!isCoffee && !isDrink && (
                      <div className="text-sm text-gray-500">
                        이 메뉴는 별도의 옵션 없이 바로 제공됩니다.
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setOptionModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmOption}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold"
                >
                  담기
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bottom Cart */}
        <div className="absolute bottom-0 left-0 w-full h-[260px] bg-white border-t border-gray-200 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20 rounded-t-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
            <div className="flex items-center gap-2 text-gray-700">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">담은 메뉴</span>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-gray-400 underline hover:text-red-500"
              >
                비우기
              </button>
            )}
          </div>

          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3 ${scrollbarHideClass}`}
          >
            <AnimatePresence>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                  <ShoppingCart className="w-10 h-10 opacity-20" />
                  <span className="text-sm">선택된 메뉴가 없습니다</span>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.cartId}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">
                        {item.name}
                      </span>
                      {item.optionLabel && (
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          {item.optionLabel}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs mt-0.5">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.cartId, -1);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.cartId, 1);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="bg-gray-900 text-white rounded-xl flex items-center justify-between px-6 h-14 shadow-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">
                  합계 · {orderType} 주문
                </span>
              </div>
              <span className="text-xl font-bold">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- [RIGHT AREA] --- */}
      <div className="w-[110px] bg-pink-50 border-l border-pink-100 flex flex-col justify-between shadow-xl z-30 shrink-0">
        <div className="flex flex-col items-center py-6 gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/voice")}
            className="w-20 h-20 rounded-2xl bg-white border-2 border-pink-200 flex flex-col items-center justify-center shadow-sm gap-1"
          >
            <Volume2 className="w-6 h-6 text-pink-500" />
            <span className="text-[11px] font-bold text-gray-600">
              음성주문
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/easy")}
            className="w-20 h-20 rounded-2xl bg-white border-2 border-orange-200 flex flex-col items-center justify-center shadow-sm gap-1"
          >
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span className="text-[11px] font-bold text-gray-600">
              쉬운주문
            </span>
          </motion.button>
        </div>

        <button
          onClick={() =>
            navigate("/payment", {
              state: { cart, orderType },
            })
          }
          disabled={cart.length === 0}
          className={`w-full h-[120px] flex flex-col items-center justify-center gap-1 transition-all ${
            cart.length > 0
              ? "bg-pink-500 text-white hover:bg-pink-600 shadow-inner cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <span className="text-xl font-extrabold leading-none">주문</span>
          <span className="text-xl font-extrabold leading-none">하기</span>
        </button>
      </div>
    </div>
  );
}
