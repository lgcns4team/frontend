// src/components/EasyMenuGrid.tsx
import type { MenuItem } from './types';

type EasyMenuGridProps = {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
};

export default function EasyMenuGrid({ items, onItemClick }: EasyMenuGridProps) {
  return (
    <div className="grid grid-cols-2 gap-8 max-w-[900px] mx-auto">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item)}
          className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col h-[380px]"
        >
          <div className="flex-1 overflow-hidden">
            <img
              src={item.img}
              alt={item.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          <div className="p-4">
            <div className="text-3xl font-extrabold">{item.name}</div>
            <div className="text-2xl font-bold text-orange-500">
              {item.price.toLocaleString()}원
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
