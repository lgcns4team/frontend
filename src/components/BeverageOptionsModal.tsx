import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Options } from "../types";

type Props = {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  // [수정 1] quantity를 별도 인자로 분리
  onAdd: (item: MenuItem, options: Options, quantity: number) => void;
};

export default function BeverageOptionsModal({
  open,
  item,
  onClose,
  onAdd,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState<Options>({
    temperature: "cold",
    whip: false,
    shot: 0,
    size: "grande",
    ice: "normal",
    isWeak: false,
  });

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setOptions({
        temperature: "cold",
        whip: false,
        shot: 0,
        size: "grande",
        ice: "normal",
        isWeak: false,
      });
    }
  }, [open]);

  const finalPrice = useMemo(() => {
    if (!item) return 0;
    let price = item.price;
    if (options.size === "tall") price -= 500;
    if (options.size === "venti") price += 500;
    if (options.shot) price += options.shot * 500;
    return price * quantity;
  }, [item, options, quantity]);

  const handleShotChange = (delta: number) => {
    setOptions((prev) => ({
      ...prev,
      shot: Math.max(0, prev.shot + delta),
    }));
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  if (!open || !item) return null;

  const isTea = item.name?.includes("티") || false;
  const isCoffee = item.category === "커피";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="w-[90%] max-w-[800px] h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full overflow-hidden">
            {/* 왼쪽 */}
            <div className="w-2/5 p-6 border-r flex flex-col items-center justify-center bg-gray-50">
              <div className="w-48 h-48 bg-gray-200 rounded-full mb-6 overflow-hidden shadow-md">
                {item.img ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" /> : <div className="text-gray-400">No Image</div>}
              </div>
              <h3 className="font-bold text-2xl text-gray-900 text-center mb-2">{item.name}</h3>
              <p className="text-3xl font-extrabold text-orange-600 mb-8">{finalPrice.toLocaleString()}원</p>

              <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
                <button onClick={() => handleQuantityChange(-1)} className="text-3xl w-8 h-8 text-gray-400 hover:text-black">-</button>
                <span className="text-2xl font-bold w-8 text-center text-gray-800">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="text-3xl w-8 h-8 text-gray-400 hover:text-black">+</button>
              </div>
            </div>

            {/* 오른쪽 */}
            <div className="w-3/5 p-8 overflow-y-auto bg-white scrollbar-hide">
              <div className="mb-8">
                <h4 className="font-bold text-lg mb-3">1. 온도</h4>
                <div className="flex gap-3">
                  {["hot", "cold"].map((t) => (
                    <button key={t} onClick={() => setOptions((prev) => ({ ...prev, temperature: t as any }))}
                      className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg ${options.temperature === t ? (t === "hot" ? "border-red-500 bg-red-50 text-red-600" : "border-blue-500 bg-blue-50 text-blue-600") : "border-gray-100 text-gray-400"}`}>
                      {t === "hot" ? "HOT 🔥" : "ICE 🧊"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-lg mb-3">2. 사이즈</h4>
                <div className="flex gap-3">
                  {["tall", "grande", "venti"].map((s) => (
                    <button key={s} onClick={() => setOptions((prev) => ({ ...prev, size: s as any }))}
                      className={`flex-1 py-4 rounded-xl border-2 font-bold uppercase text-lg ${options.size === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-100 text-gray-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {isCoffee && !isTea && (
                <div className="mb-8">
                  <h4 className="font-bold text-lg mb-3">3. 커피 옵션</h4>
                  <div className="flex gap-3 mb-3">
                    <button onClick={() => setOptions((s) => ({ ...s, isWeak: !s.isWeak }))}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold ${options.isWeak ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-100 text-gray-400"}`}>
                      연하게 💧
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-600">샷 추가 (+500원)</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleShotChange(-1)} className="w-8 h-8 rounded-full bg-white border text-gray-500 hover:text-black">-</button>
                      <span className="font-bold text-lg w-4 text-center">{options.shot}</span>
                      <button onClick={() => handleShotChange(1)} className="w-8 h-8 rounded-full bg-white border text-gray-500 hover:text-black">+</button>
                    </div>
                  </div>
                </div>
              )}

              {!isTea && (
                <div>
                  <h4 className="font-bold text-lg mb-3">{isCoffee ? "4." : "3."} 휘핑 옵션</h4>
                  <div className="flex gap-3">
                    <button onClick={() => setOptions((s) => ({ ...s, whip: true }))} className={`flex-1 py-3 rounded-xl border-2 font-bold ${options.whip ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-100 text-gray-400"}`}>휘핑 추가 ☁️</button>
                    <button onClick={() => setOptions((s) => ({ ...s, whip: false }))} className={`flex-1 py-3 rounded-xl border-2 font-bold ${!options.whip ? "border-gray-900 bg-gray-900 text-white" : "border-gray-100 text-gray-400"}`}>휘핑 없음 🚫</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
            <button onClick={onClose} className="flex-1 py-4 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 text-lg">취소하기</button>
            {/* [수정 2] onAdd 호출 시 options와 quantity를 따로 전달 */}
            <button onClick={() => onAdd(item, options, quantity)} className="flex-[2] py-4 rounded-xl bg-orange-600 text-white font-bold text-xl shadow-lg hover:bg-orange-700">
              {finalPrice.toLocaleString()}원 담기
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}