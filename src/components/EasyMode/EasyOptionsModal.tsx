// src/components/EasyMode/EasyBeverageOptionsModal.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuItem, Options } from '../../types';

type Props = {
  open: boolean;
  item: (MenuItem & { options?: Pick<Options, 'temperature'> }) | null; // ✅ options 허용
  onClose: () => void;
  onAdd: (item: MenuItem, options: Pick<Options, 'temperature'>, quantity: number) => void;
};

export default function EasyBeverageOptionsModal({ open, item, onClose, onAdd }: Props) {
  const [temperature, setTemperature] = useState<Options['temperature']>('cold');

  useEffect(() => {
    if (!open) return;

    // 편집이면 기존 값 유지, 없으면 cold
    const prev = item?.options?.temperature;
    setTemperature(prev ?? 'cold');
  }, [open, item]);

  if (!open || !item) return null;

  const handleAdd = () => {
    onAdd(item, { temperature }, 1);
  };

  const imageSrc = item.img;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-[700px] max-w-[95vw] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 flex flex-col items-center justify-center px-8 pt-10 pb-8 gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-md bg-gray-100">
                {imageSrc && (
                  <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl font-bold text-gray-800">{item.name}</div>
                <div className="text-4xl font-extrabold text-red-500">
                  {item.price.toLocaleString()}원
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => setTemperature('cold')}
                    className={`flex flex-col items-center justify-center px-8 py-4 rounded-2xl border-2 text-lg font-semibold min-w-[150px]
                      ${
                        temperature === 'cold'
                          ? 'border-red-400 bg-red-50 text-red-500'
                          : 'border-gray-200 text-gray-700 bg-white'
                      }`}
                  >
                    <span className="text-2xl mb-1">❄️</span>
                    <span>아이스</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemperature('hot')}
                    className={`flex flex-col items-center justify-center px-8 py-4 rounded-2xl border-2 text-lg font-semibold min-w-[150px]
                      ${
                        temperature === 'hot'
                          ? 'border-red-400 bg-red-50 text-red-500'
                          : 'border-gray-200 text-gray-700 bg-white'
                      }`}
                  >
                    <span className="text-2xl mb-1">🔥</span>
                    <span>핫</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t flex">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-3xl py-7 rounded-bl-3xl"
              >
                주문하기 (담기)
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-56 bg-white text-red-500 border-l border-red-200 font-bold text-3xl py-7 rounded-br-3xl"
              >
                이전으로
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
