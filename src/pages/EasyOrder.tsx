// src/pages/EasyOrder.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';

import BottomCart from '../components/BottomCart';
import EasyMenuGrid from '../components/EasyMode/EasyMenuGrid';
import EasyBeverageOptionsModal from '../components/EasyMode/EasyOptionsModal';

import type { MenuItem, Options } from '../types';

type EasyCategoryKey = 'COFFEE' | 'DRINK' | 'DESSERT' | 'RECOMMEND';

const EASY_CATEGORIES: { key: EasyCategoryKey; name: string; emoji: string }[] = [
  { key: 'COFFEE', name: '커피', emoji: '☕️' },
  { key: 'DRINK', name: '음료', emoji: '🥤' },
  { key: 'DESSERT', name: '디저트', emoji: '🍰' },
  { key: 'RECOMMEND', name: '추천메뉴', emoji: '🍊' },
];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { items, recommendedItems, isLoading } = useMenu();
  const { cart, addToCart, updateCartOptions } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<EasyCategoryKey | null>(null);
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editCartId, setEditCartId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<
    (MenuItem & { options?: Pick<Options, 'temperature'> }) | null
  >(null);

  const selectedCategoryLabel = useMemo(() => {
    const found = EASY_CATEGORIES.find((c) => c.key === selectedCategory);
    return found?.name ?? '';
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];

    switch (selectedCategory) {
      case 'COFFEE':
        return items.filter((item: any) => item.categoryId === 1);
      case 'DRINK':
        return items.filter((item: any) => item.categoryId === 2);
      case 'DESSERT':
        return items.filter((item: any) => item.categoryId === 3);
      case 'RECOMMEND':
        return recommendedItems;
      default:
        return [];
    }
  }, [selectedCategory, items, recommendedItems]);

  const handleItemClick = (item: MenuItem) => {
    // 옵션모달 띄울 대상: 커피(1), 음료(2)
    const cid = (item as any).categoryId;
    if (cid === 1 || cid === 2) {
      setSelectedItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleAddWithOptions = (
    item: MenuItem,
    options: Pick<Options, 'temperature'>,
    quantity: number
  ) => {
    addToCart(item, options, quantity);
    setSelectedItem(null);
  };

  const handleEditOptions = (cartId: string) => {
    const target = cart.find((c: any) => c.cartId === cartId);
    if (!target) return;

    setEditCartId(cartId);
    setEditItem({
      ...(target as any),
      options: (target as any).options ?? { temperature: 'cold' },
    });
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">NOK NOK</h1>
          <button
            onClick={() => navigate('/')}
            className="text-base text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-8 h-8" />
            <span>처음으로</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl pb-8">
                  {EASY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center aspect-square hover:bg-orange-100 hover:border-orange-400 border-6 border-transparent transition-all duration-200"
                    >
                      <span className="text-[10rem] mb-6">{cat.emoji}</span>
                      <span
                        className="text-6xl font-extrabold whitespace-nowrap break-keep leading-none"
                        style={{ writingMode: 'horizontal-tb' }}
                      >
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-2xl font-bold text-gray-700"
                >
                  <ArrowLeft className="w-8 h-8" />
                  <span>뒤로가기</span>
                </button>

                <h2 className="text-5xl font-bold text-center flex-1">{selectedCategoryLabel}</h2>
                <div className="w-[140px]" />
              </div>

              {isLoading ? (
                <div className="text-center text-2xl">메뉴를 불러오는 중입니다...</div>
              ) : (
                <EasyMenuGrid items={filteredItems} onItemClick={handleItemClick} />
              )}
            </div>
          )}
        </main>

        <BottomCart
          onCheckout={() => navigate('/easy/confirm')}
          onEditOptions={handleEditOptions}
          orderMethod={orderMethod}
          onOrderMethodChange={setOrderMethod}
        />

        <EasyBeverageOptionsModal
          open={Boolean(selectedItem || editItem)}
          item={selectedItem ?? editItem}
          onClose={() => {
            setSelectedItem(null);
            setEditItem(null);
            setEditCartId(null);
          }}
          onAdd={(item, options, quantity) => {
            if (editCartId) {
              updateCartOptions(editCartId, options);
              setEditItem(null);
              setEditCartId(null);
              return;
            }
            handleAddWithOptions(item, options, quantity);
          }}
        />
      </div>
    </div>
  );
}
