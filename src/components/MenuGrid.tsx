import { motion } from 'framer-motion';
import type { MenuItem } from '../types/index';

interface MenuGridProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export default function MenuGrid({ items, onItemClick }: MenuGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4 pb-20">
      {items.map((item, index) => (
        <motion.div
          // [핵심 수정] id가 있어도 혹시 모를 중복을 대비해 category와 index를 섞어서 완벽한 유니크 키 생성
          key={`${item.category}-${item.id || index}`}
          whileTap={{ scale: 0.95 }}
          onClick={() => onItemClick(item)}
          className="bg-white rounded-[24px] p-3 shadow-sm border border-black/5 flex flex-col gap-2 cursor-pointer h-full"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {item.img ? (
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between flex-1 px-1 pb-1">
            <h3 className="font-bold text-base text-gray-800 leading-tight break-keep">
              {item.name}
            </h3>
            <p className="text-orange-600 font-bold text-base mt-1">
              {/* 가격에 쉼표 표시 */}
              {item.price ? item.price.toLocaleString() : '0'}원
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
