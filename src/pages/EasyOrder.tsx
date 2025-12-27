// src/pages/EasyOrder.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useMenu } from '../hooks/UseMenu';
import { useCartStore } from '../store/UseCartStore';

import EasyMenuGrid from '../components/EasyMenuGrid';
import EasyBeverageOptionsModal from '../components/EasyOptionsModal';
import BottomCart from '../components/BottomCart';

import microphoneIcon from '../assets/icons/microphone.svg';
import fingerIcon from '../assets/icons/finger.svg';

import type { MenuItem, Options } from '../types';

type EasyCategory = {
  name: string;
  emoji: string;
};

const EASY_CATEGORIES: EasyCategory[] = [
  { name: '커피', emoji: '☕️' },
  { name: '차', emoji: '🍵' },
  { name: '다른 음료', emoji: '🥤' },
  { name: '디저트', emoji: '🍰' },
  { name: '추천메뉴', emoji: '⭐️' },
  { name: '세트메뉴', emoji: '🍿' },
];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { basicItems, recommendedItems, isLoading } = useMenu();

  //  updateOptions만 추가 사용
  const { cart, addToCart, updateOptions } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  //  옵션 수정 중인 cartId
  const [editingCartId, setEditingCartId] = useState<string | null>(null);

  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');

  const mappedCategory = useMemo(() => {
    if (!selectedCategory) return null;
    if (selectedCategory === '다른 음료') return '음료';
    return selectedCategory;
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    if (!mappedCategory) return [];
    if (mappedCategory === '추천 메뉴') return recommendedItems;
    return basicItems.filter((it) => it.category === mappedCategory);
  }, [mappedCategory, recommendedItems, basicItems]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
        {/* 헤더 */}
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

        {/* 상단 버튼 */}
        <div className="bg-white pb-2 shadow-sm z-10 shrink-0">
          <div className="flex gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/order')}
              className="flex-1 bg-pink-50 p-8 rounded-xl border border-pink-100 flex items-center justify-center gap-2"
            >
              <img src={microphoneIcon} className="w-10 h-10" />
              <span className="font-bold text-xl">음성 주문</span>
            </button>

            <button
              onClick={() => navigate('/voice')}
              className="flex-1 bg-orange-50 p-8 rounded-xl border border-orange-100 flex items-center justify-center gap-2"
            >
              <img src={fingerIcon} className="w-12 h-12" />
              <span className="font-bold text-xl">일반 주문</span>
            </button>
          </div>
        </div>

        {/* 메인 */}
        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl pb-8">
                  {EASY_CATEGORIES.map((cat) => {
                    const isTwoLine = ['다른 음료', '추천메뉴', '세트메뉴'].includes(cat.name);
                    const [line1, line2] =
                      cat.name === '다른 음료' ? ['다른', '음료'] : cat.name.split(/(?=메뉴)/);

                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center aspect-square"
                      >
                        <span className="text-[7rem] mb-6">{cat.emoji}</span>

                        {isTwoLine ? (
                          <span className="text-6xl font-extrabold text-center h-[120px] flex flex-col justify-center">
                            <span>{line1}</span>
                            <span>{line2}</span>
                          </span>
                        ) : (
                          <span className="text-6xl font-extrabold h-[120px] flex items-center">
                            {cat.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-3xl font-extrabold bg-gray-200 px-8 py-4 rounded-2xl"
                >
                  ← 뒤로
                </button>

                <div className="text-5xl font-extrabold">{selectedCategory}</div>

                <button
                  onClick={() => navigate('/easy/confirm')}
                  className="text-3xl font-extrabold bg-pink-400 text-white px-8 py-4 rounded-2xl"
                >
                  주문확인 →
                </button>
              </div>

              {isLoading ? (
                <div className="h-full flex items-center justify-center text-3xl font-bold">
                  메뉴 불러오는 중...
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pb-6">
                  <EasyMenuGrid
                    items={filteredItems}
                    onItemClick={(item) => {
                      if (item.category === '커피' || item.category === '음료') {
                        setSelectedItem(item);
                        setEditingCartId(null); // 일반 추가 모드
                      } else {
                        addToCart(item);
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/*  옵션변경 연결 */}
        {cart.length > 0 && (
          <BottomCart
            onCheckout={() => navigate('/easy/confirm')}
            orderMethod={orderMethod}
            onOrderMethodChange={setOrderMethod}
            onEditOptions={(cartId) => {
              const target = cart.find((c) => c.cartId === cartId);
              if (!target) return;
              setSelectedItem(target);
              setEditingCartId(cartId);
            }}
          />
        )}

        {/* 옵션 모달 */}
        <EasyBeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setEditingCartId(null);
          }}
          onAdd={(item, opts: Pick<Options, 'temperature'>, qty) => {
            if (editingCartId) {
              //  옵션 변경
              updateOptions(editingCartId, opts);
            } else {
              //  새로 담기
              addToCart(item, opts, qty);
            }
            setSelectedItem(null);
            setEditingCartId(null);
          }}
        />
      </div>
    </div>
  );
}
