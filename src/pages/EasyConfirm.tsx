// src/pages/EasyConfirm.tsx
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useCartStore } from '../store/UseCartStore';

export default function EasyConfirm() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCartStore();

  const firstItem = cart[0];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 장바구니가 비어있으면 다시 쉬운 주문으로
  if (!firstItem) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <button
          onClick={() => navigate('/easy')}
          className="px-8 py-4 bg-pink-500 rounded-2xl font-bold text-2xl"
        >
          먼저 메뉴를 선택해주세요
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* 90도 회전된 전체 캔버스 */}
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-pink-50 flex flex-col shadow-2xl relative">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-8 py-5">
          <h1 className="text-3xl font-extrabold">주문 확인</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-2xl font-bold"
          >
            <Home className="w-7 h-7" />
            <span>처음으로</span>
          </button>
        </header>

        {/* 🔹 상단 고정 안내 문구 (카드 밖, 핑크 배경 위에 고정) */}
        <div className="absolute left-1/2 top-28 -translate-x-1/2 text-center pointer-events-none z-10">
          <p className="text-5xl font-extrabold text-gray-900 leading-tight whitespace-nowrap">
            주문 내역을 확인해주세요
          </p>
        </div>

        <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-4 overflow-hidden">
          <div className="w-full max-w-[800px] bg-white/95 rounded-3xl p-10 shadow-2xl flex flex-col h-full max-h-[1050px]">
            <div className="mb-10">
              <div className="border-b border-gray-300 pb-3 mb-5">
                <div className="text-4xl font-extrabold">주문 내역</div>
              </div>
            </div>
            {/* 리스트 영역: 최대 3개 정도까지 보이고 이후는 스크롤 */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <ul className="space-y-5 text-4xl">
                {cart.map((item) => (
                  <li
                    key={item.cartId}
                    className="flex items-center gap-10 pb-5 border-b last:border-b-0"
                  >
                    {/*  왼쪽 영역: 이미지 + 가격 + 메뉴명 */}
                    <div className="flex flex-col flex-[2] gap-4">
                      {/* 이미지 + 가격 한 줄 */}
                      <div className="flex items-center gap-1flex-[1]justify-between">
                        {/* 이미지 */}
                        <div className="w-[130px] h-[130px] rounded-3xl overflow-hidden bg-white shadow-lg shrink-0">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* 가격 */}
                        <div className="text-4xl md:text-5xl font-extrabold text-gray-900 whitespace-nowrap min-w-[200px] text-right">
                          {(item.price * item.quantity).toLocaleString()}원
                        </div>
                      </div>

                      {/* 메뉴명 + 온도 옵션 */}
                      <div className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-snug">
                        {item.name}
                        {item.options?.temperature && (
                          <span className="text-3xl font-bold text-gray-600 ml-3">
                            ({item.options.temperature === 'hot' ? '뜨겁게' : '차갑게'})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 🔹 오른쪽 영역: 수량 조절 + 삭제 */}
                    <div className="flex items-center gap-1 flex-[1] justify-end">
                      {/* - 버튼 */}
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity <= 1) return;
                          updateQuantity(item.cartId, item.quantity - 1);
                        }}
                        className="w-[30px] h-[30px] rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-3xl font-bold"
                      >
                        -
                      </button>

                      <span className="text-3xl font-extrabold w-[50px] text-center">
                        {item.quantity}
                      </span>

                      {/* + 버튼 */}
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-[30px] h-[30px] rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-3xl font-bold"
                      >
                        +
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId)}
                        className="ml-3 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-2xl font-bold whitespace-nowrap"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 합계 */}
            <div className="border-t border-gray-300 mt-10 pt-10 text-right text-5xl font-extrabold">
              합계 {total.toLocaleString()}원
            </div>
          </div>
        </main>

        {/* 🔹 하단 고정 버튼 영역 (카드와 완전히 분리) */}
        <footer className="w-full flex justify-center px-6 pb-10">
          <div className="w-full max-w-[900px] flex flex-col gap-6">
            {/* 이전으로 */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 py-8 text-3xl font-extrabold rounded-3xl"
            >
              이전으로
            </button>

            {/* 추가 주문하기 / 결제하기 */}
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => navigate('/easy')}
                className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-900 py-8 text-4xl font-extrabold rounded-3xl"
              >
                추가 주문하기
              </button>

              <button
                type="button"
                onClick={() => navigate('/payment')}
                className="flex-1 bg-pink-400 hover:bg-pink-500 text-white py-8 text-4xl font-extrabold rounded-3xl"
              >
                결제하기
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
