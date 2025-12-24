// src/pages/EasyConfirm.tsx
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/UseCartStore';
import { Home } from 'lucide-react';

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
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-pink-50 flex flex-col shadow-2xl relative overflow-hidden">
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

        {/* 상단 고정 안내 문구 */}
        <div className="absolute left-1/2 top-28 -translate-x-1/2 text-center pointer-events-none z-10">
          <p className="text-[46px] font-extrabold text-gray-900 leading-tight whitespace-nowrap tracking-tight">
            주문 내역을 확인해주세요
          </p>
        </div>

        {/* 메인 */}
        <main className="flex-1 flex items-center justify-center px-6 pb-10 pt-32 overflow-hidden">
          {/* 주문 내역 카드 */}
          <div className="w-full max-w-[900px] bg-white/95 rounded-3xl p-10 shadow-2xl h-[980px] flex flex-col overflow-hidden">
            {/* 제목 */}
            <div className="mb-8 shrink-0">
              <div className="border-b border-gray-300 pb-4">
                <div className="text-[40px] font-extrabold">주문내역</div>
              </div>
            </div>

            {/* ✅ 리스트 영역: 기본 4개 보이도록 높이를 제한 + 세로 스크롤 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
              <ul className="space-y-6">
                {cart.map((item) => (
                  <li
                    key={item.cartId}
                    className="flex items-center gap-8 pb-8 border-b last:border-b-0 w-full min-w-0 overflow-x-hidden"
                  >
                    {/* 왼쪽: 이미지 + 이름/옵션 */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="w-[140px] h-[140px] rounded-3xl overflow-hidden bg-white shadow-lg shrink-0">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-4xl font-extrabold text-gray-800 truncate">
                          {item.name}
                        </div>
                        {item.options?.temperature && (
                          <div className="text-2xl font-bold text-gray-600 whitespace-nowrap mt-1">
                            ({item.options.temperature === 'hot' ? '뜨겁게' : '차갑게'})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 가운데: 가격 (항상 가로) */}
                    <div className="shrink-0 text-4xl font-extrabold text-gray-900 whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>

                    {/* 오른쪽: 수량 + 삭제 (항상 가로, 절대 줄바꿈 금지) */}
                    <div className="shrink-0 flex items-center gap-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => item.quantity > 1 && updateQuantity(item.cartId, -1)}
                        className="w-[40px] h-[40px] rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-3xl font-bold"
                      >
                        -
                      </button>

                      <span className="text-4xl font-extrabold w-[20px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartId, 1)}
                        className="w-[40px] h-[40px] rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-3xl font-bold"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId)}
                        className="ml-2 w-[100px] h-[64px] rounded-2xl bg-red-500 hover:bg-red-600 text-white text-2xl font-extrabold flex items-center justify-center"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 합계 (고정) */}
            <div className="border-t border-gray-300 mt-3 pt-3 text-right text-[32px] font-extrabold shrink-0">
              합계 {total.toLocaleString()}원
            </div>
          </div>
        </main>

        {/* 하단 고정 버튼 */}
        <footer className="w-full flex justify-center px-6 pb-10 shrink-0">
          <div className="w-full max-w-[900px] flex flex-col gap-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 py-7 text-3xl font-extrabold rounded-3xl"
            >
              이전으로
            </button>

            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => navigate('/easy')}
                className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-900 py-7 text-4xl font-extrabold rounded-3xl"
              >
                추가 주문하기
              </button>

              <button
                type="button"
                onClick={() => navigate('/payment')}
                className="flex-1 bg-pink-400 hover:bg-pink-500 text-white py-7 text-4xl font-extrabold rounded-3xl"
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
