import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Mic, RefreshCcw, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HomeButton } from "@/components/home-button"

export default function VoiceOrder() {
  const navigate = useNavigate()
  const [state, setState] = useState<"listening" | "processing" | "confirm">("listening")

  useEffect(() => {
    if (state === "listening") {
      const timer = setTimeout(() => setState("processing"), 3500)
      return () => clearTimeout(timer)
    }
    if (state === "processing") {
      const timer = setTimeout(() => setState("confirm"), 2000)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <div className="relative w-[540px] h-[900px] mx-auto bg-black overflow-hidden cursor-pointer select-none shadow-2xl my-10">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {state === "listening" && (
        <div className="text-center space-y-16 relative z-10 w-full max-w-3xl">
          <div className="relative">
            {/* Ripple Effect */}
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="absolute inset-0 bg-pink-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="w-64 h-64 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl mx-auto relative z-10"
            >
              <Mic className="w-32 h-32 text-white" />
            </motion.div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-800">듣고 있어요...</h2>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md border border-pink-100 p-8 rounded-3xl shadow-lg max-w-xl mx-auto"
            >
              <p className="text-gray-500 font-medium text-xl mb-4">💡 이렇게 말해보세요</p>
              <p className="text-3xl font-black text-pink-600">"따뜻한 라떼 2잔 주세요"</p>
            </motion.div>
          </div>
        </div>
      )}

      {state === "processing" && (
        <div className="flex flex-col items-center gap-12 z-10">
          <h2 className="text-3xl font-bold text-gray-700">주문을 분석하고 있습니다</h2>
          <div className="flex items-center gap-3 h-32">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div
                key={i}
                animate={{ height: [40, 120, 40], backgroundColor: ["#f9a8d4", "#ec4899", "#f9a8d4"] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: i * 0.1 }}
                className="w-6 bg-pink-500 rounded-full"
              />
            ))}
          </div>
        </div>
      )}

      {state === "confirm" && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-pink-100 z-10"
        >
          <div className="bg-pink-50 p-8 text-center border-b border-pink-100">
            <p className="text-gray-500 font-bold mb-2">인식된 주문</p>
            <p className="text-3xl font-black text-gray-800">"따뜻한 라떼 2잔, 케이크 하나"</p>
          </div>

          <div className="p-8 space-y-4 bg-white">
            {/* Mocked Matched Items */}
            <div className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
                  <img src="/latte-art.png" alt="Latte" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-800">카페라떼 (HOT)</p>
                  <p className="text-gray-500 text-lg">3,000원</p>
                </div>
              </div>
              <div className="font-black text-2xl bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl">2개</div>
            </div>
            <div className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
                  <img src="/chocolate-cake-slice.png" alt="Cake" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-800">초코 케이크</p>
                  <p className="text-gray-500 text-lg">5,000원</p>
                </div>
              </div>
              <div className="font-black text-2xl bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl">1개</div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex gap-6">
            <Button
              variant="outline"
              className="flex-1 h-20 text-2xl rounded-2xl border-2 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-gray-600 font-bold bg-transparent"
              onClick={() => setState("listening")}
            >
              <RefreshCcw className="mr-3 w-6 h-6" /> 다시 말하기
            </Button>
            <Button
              className="flex-[2] h-20 text-2xl rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg"
              onClick={() => navigate("/payment")}
            >
              이대로 주문 <ArrowRight className="ml-3 w-8 h-8" />
            </Button>
          </div>
        </motion.div>
      )}

      <HomeButton />
    </div>
  )
}

