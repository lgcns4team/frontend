import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { HomeButton } from "@/components/home-button"

// Steps: 0=Category, 1=Menu, 2=Option, 3=Confirm
const STEPS = ["카테고리 선택", "메뉴 선택", "옵션 선택", "주문 확인"]

const EASY_CATEGORIES = [
  { name: "커피", img: "/coffee-cup.png" },
  { name: "음료", img: "/juice-glass.jpg" },
  { name: "디저트", img: "/chocolate-cake-slice.png" },
  { name: "세트메뉴", img: "/meal-set.jpg" },
]

const EASY_MENU = [
  { name: "아메리카노", price: 2000, img: "/iced-americano.jpg" },
  { name: "카페라떼", price: 3000, img: "/iced-latte.png" },
  { name: "쌍화차", price: 3500, img: "/korean-tea.jpg" },
  { name: "카라멜", price: 5000, img: "/caramel-macchiato.png" },
]

export default function EasyOrder() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selection, setSelection] = useState<any>({})

  const handleBack = () => {
    if (step === 0) navigate("/order")
    else setStep(step - 1)
  }

  return (
    <div className="relative w-[540px] h-[900px] mx-auto bg-black overflow-hidden cursor-pointer select-none shadow-2xl my-10">
      {/* Header */}
      <div className="bg-pink-500 h-24 flex items-center relative shadow-lg px-6 z-20">
        <button
          onClick={handleBack}
          className="absolute left-6 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="w-full text-center text-4xl font-black text-white tracking-tight">{STEPS[step]}</h1>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-8 h-full pb-20"
            >
              {EASY_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelection({ ...selection, category: cat.name })
                    setStep(1)
                  }}
                  className="bg-white rounded-[3rem] shadow-xl flex flex-col items-center justify-center p-8 border-8 border-transparent hover:border-pink-300 transition-all active:scale-95 group"
                >
                  <div className="relative w-48 h-48 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={cat.img || "/placeholder.svg"}
                      alt={cat.name}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  <span className="text-5xl font-black text-gray-800">{cat.name}</span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-2 gap-8 h-full pb-20"
            >
              {EASY_MENU.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setSelection({ ...selection, menu: item })
                    setStep(2)
                  }}
                  className="bg-white rounded-[3rem] shadow-xl flex flex-col items-center p-8 active:scale-95 transition-transform border-4 border-white hover:border-pink-200"
                >
                  <div className="w-full aspect-square relative mb-6 bg-gray-50 rounded-[2rem] overflow-hidden shadow-inner">
                    <img src={item.img || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-4xl font-black mb-3 text-gray-900">{item.name}</span>
                  <span className="text-3xl font-bold text-pink-600 bg-pink-50 px-6 py-2 rounded-full">
                    {item.price.toLocaleString()}원
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full pb-20"
            >
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center w-full max-w-2xl border-4 border-pink-100">
                <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden mb-8 shadow-lg">
                  <img src={selection.menu?.img || "/placeholder.svg"} alt="Selected" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-5xl font-black mb-4 text-gray-800">{selection.menu?.name}</h2>
                <p className="text-4xl text-pink-600 font-bold mb-12">{selection.menu?.price.toLocaleString()}원</p>

                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => navigate("/payment")}
                    className="bg-red-500 text-white py-8 rounded-3xl text-4xl font-bold hover:bg-red-600 shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <span>🔥</span>
                    <span>따뜻하게</span>
                  </button>
                  <button
                    onClick={() => navigate("/payment")}
                    className="bg-blue-500 text-white py-8 rounded-3xl text-4xl font-bold hover:bg-blue-600 shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <span>❄️</span>
                    <span>시원하게</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HomeButton />
    </div>
  )
}

