// src/pages/EasyOrder.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useCartStore } from '../store/UseCartStore';
import BottomCart from '../components/BottomCart';
import EasyMenuGrid from '../components/EasyMenuGrid';
import EasyBeverageOptionsModal from '../components/EasyOptionsModal';
import type { MenuItem, Options } from '../types';

//  목업 가져오기 (경로 확인: src/api/tempmock.ts 맞지?)
import { tempMockCategories } from '../api/tempmock';
// (옵션 목업은 지금 EasyOrder에서는 안 씀. 옵션 모달에서 필요하면 그쪽에서 쓰면 됨)
// import { tempMockOptions } from '../api/tempmock';

const EASY_CATEGORIES = [
  { name: '커피', emoji: '☕️' },
  { name: '차', emoji: '🫖' },
  { name: '다른 음료', emoji: '🥤' }, // 여기 통일
  { name: '디저트', emoji: '🍰' },
  { name: '추천메뉴', emoji: '🍊' },
  { name: '세트메뉴', emoji: '🍽️' },
] as const;

type EasyCategory = (typeof EASY_CATEGORIES)[number]['name'];

export default function EasyOrder() {
  const navigate = useNavigate();
  const { cart, addToCart } = useCartStore();
  const [orderMethod, setOrderMethod] = useState<'dine-in' | 'takeout'>('dine-in');

  //  목업 기반 items / loading
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<EasyCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  //  CategoryResponse[] (tempmock) -> MenuItem[] (Easy 화면용) 변환
  useEffect(() => {
    setIsLoading(true);

    // tempMockCategories 구조:
    // [{ categoryName, menus: [{ id, name, price, imageUrl ...}] }]
    const flat: MenuItem[] = tempMockCategories.flatMap((cat) =>
      (cat.menus ?? []).map((m: any) => ({
        //  EasyOrder에서 쓰는 MenuItem 필드에 맞춰 매핑
        id: String(m.id),
        name: m.name,
        price: m.price,

        // EasyMenuGrid는 item.img 사용 중이었지? -> 여기서 채워줌
        // imageUrl이 비어있으면 그냥 ''로 두면 빈 이미지로 뜸.
        img: m.imageUrl ?? '',

        // EasyOrder에서 category 필터링 하니까 category를 꼭 넣어야 함
        category: cat.categoryName,

        // 나머지는 프로젝트 타입에 따라 있을 수도/없을 수도
        isSoldOut: m.isSoldOut ?? false,
        isActive: m.isActive ?? true,
      }))
    );

    setItems(flat);
    setIsLoading(false);
  }, []);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];

    switch (selectedCategory) {
      case '커피':
        return items.filter((item) => item.category === '커피');

<<<<<<< HEAD
      // "다른음료"는 원본 category가 "음료"인 것들을 보여줌
      case '다른음료':
=======
      case '다른 음료':
>>>>>>> 0273dde (feat: easy order UI mock data 연결 및 화면 수정)
        return items.filter((item) => item.category === '음료');

      case '차': {
        const byCategory = items.filter((item) => item.category === '차');
        if (byCategory.length > 0) return byCategory;
        return items.filter((item) => item.name.includes('티'));
      }

      case '디저트':
        return items.filter((item) => item.category === '디저트');

      case '추천메뉴':
        return items.slice(0, 8);

      case '세트메뉴':
        // 목업에 세트 없으면 디저트 일부라도 보여주게
        return items.filter((item) => item.category === '세트').length
          ? items.filter((item) => item.category === '세트')
          : items.filter((item) => item.category === '디저트').slice(0, 8);

      default:
        return [];
    }
  }, [selectedCategory, items]);

  const handleItemClick = (item: MenuItem) => {
    if (item.category === '커피' || item.category === '음료') {
      setSelectedItem(item);
      return;
    }
    addToCart(item);
  };

  const handleAddWithOptions = (
    item: MenuItem,
    options: Pick<Options, 'temperature'>,
    quantity: number
  ) => {
    addToCart(item, options, quantity);
    setSelectedItem(null);
  };

<<<<<<< HEAD
  // 카테고리 화면에서는 cart 있을 때만 BottomCart 보이게
  const shouldShowBottomCart = !selectedCategory ? cart.length > 0 : true;
=======
  const handleEditOptions = () => {
    // EasyOrder에서는 옵션 수정 기능을 사용하지 않음
  };

  const shouldShowBottomCart = selectedCategory ? true : cart.length > 0;
>>>>>>> 0273dde (feat: easy order UI mock data 연결 및 화면 수정)

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-white flex flex-col shadow-2xl">
<<<<<<< HEAD
        {/* 메인(Order) 페이지와 동일한 헤더 */}
=======
        {/* 헤더 */}
>>>>>>> 0273dde (feat: easy order UI mock data 연결 및 화면 수정)
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

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col p-10 overflow-hidden">
          {!selectedCategory ? (
            <>
              <div className="text-center mb-20">
                <h2 className="text-6xl font-extrabold">무엇을 주문하시겠어요?</h2>
              </div>

              <div className="flex-1 flex justify-center overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl pb-8">
                  {EASY_CATEGORIES.map((cat) => {
                    const isOtherBeverage = cat.name === '다른 음료';

                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center aspect-square hover:bg-orange-100 hover:border-orange-400 border-6 border-transparent transition-all duration-200"
                      >
<<<<<<< HEAD
                        {/* 이모지: '커피 외 음료'만 위로 */}
=======
>>>>>>> 0273dde (feat: easy order UI mock data 연결 및 화면 수정)
                        <span className={`text-[10rem] mb-6 ${isOtherBeverage ? '-mt-6' : ''}`}>
                          {cat.emoji}
                        </span>

<<<<<<< HEAD
                        {/* 텍스트: '커피 외 음료'만 3줄로 */}
=======
>>>>>>> 0273dde (feat: easy order UI mock data 연결 및 화면 수정)
                        {isOtherBeverage ? (
                          <span className="text-6xl font-extrabold leading-[1.05] text-center">
                            <span className="block">다른</span>
                            <span className="block">음료</span>
                          </span>
                        ) : (
                          <span
                            className="text-6xl font-extrabold whitespace-nowrap break-keep leading-none"
                            style={{ writingMode: 'horizontal-tb' }}
                          >
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
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-2xl font-bold text-gray-700"
                >
                  <ArrowLeft className="w-8 h-8" />
                  <span>뒤로가기</span>
                </button>

                <h2 className="text-5xl font-bold text-center flex-1">{selectedCategory}</h2>
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

        {/* 하단 장바구니 */}
<<<<<<< HEAD
        {shouldShowBottomCart && <BottomCart onCheckout={() => navigate('/easy/confirm')} />}
=======
        {shouldShowBottomCart && (
          <BottomCart
            onCheckout={() => navigate('/easy/confirm')}
            onEditOptions={handleEditOptions}
            orderMethod={orderMethod}
            onOrderMethodChange={setOrderMethod}
          />
        )}
>>>>>>> 0273dde (feat: easy order UI mock data 연결 및 화면 수정)

        {/* 옵션 모달 */}
        <EasyBeverageOptionsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddWithOptions}
        />
      </div>
    </div>
  );
}
