import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CreditCard, CheckCircle2, ArrowLeft } from "lucide-react"
import { HomeButton } from "@/components/home-button"

export default function Payment() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<"insert" | "processing" | "complete">("insert")
  const [orderNum] = useState(Math.floor(Math.random() * 900) + 100)

  useEffect(() => {
    if (status === "insert") {
      const timer = setTimeout(() => setStatus("processing"), 3000) // Simulate card insertion
      return () => clearTimeout(timer)
    }
    if (status === "processing") {
      const timer = setTimeout(() => setStatus("complete"), 2500) // Simulate processing
      return () => clearTimeout(timer)
    }
    if (status === "complete") {
      const timer = setTimeout(() => navigate("/"), 6000) // Auto return home
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  return (
    <div className="relative w-[540px] h-[900px] mx-auto bg-black overflow-hidden cursor-pointer select-none shadow-2xl my-10">
      {/* Back Button for safety */}
      {status === "insert" && (
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 px-6 py-3 bg-gray-100 rounded-full font-bold text-gray-600 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> 취소
        </button>
      )}

      {status !== "complete" ? (
        <div className="text-center space-y-16 w-full max-w-lg z-10">
          <div className="bg-pink-50 py-16 px-10 rounded-[3rem] relative overflow-hidden shadow-inner border-4 border-pink-100">
            {/* Progress Bar */}
            <motion.div
              className="absolute top-0 left-0 w-full h-2 bg-pink-500"
              initial={{ width: "0%" }}
              animate={status === "processing" ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />

            <h2 className="text-4xl font-black mb-4 text-gray-800 leading-tight">
              {status === "insert" ? "신용카드를\n투입구에 넣어주세요" : "결제가\n진행 중입니다..."}
            </h2>

            <div className="relative h-56 w-56 mx-auto mt-12">
              {/* Card Animation */}
              <div className="absolute inset-x-0 top-0 h-6 bg-gray-300 rounded-full shadow-inner" />
              <motion.div
                animate={status === "insert" ? { y: [0, 60, 0] } : { y: 65 }}
                transition={{
                  repeat: status === "insert" ? Number.POSITIVE_INFINITY : 0,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="absolute inset-x-12 top-4 h-40 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl border-2 border-white/50 shadow-2xl flex items-end justify-end p-4"
              >
                <div className="w-12 h-8 bg-yellow-400/80 rounded-md" />
                <span className="absolute bottom-4 left-4 text-white/50 font-mono text-sm">**** 1234</span>
              </motion.div>
            </div>
          </div>

          {/* Device Visuals */}
          <div className="grid grid-cols-2 gap-8 opacity-40">
            <div className="border-4 border-dashed border-black/20 h-40 rounded-3xl flex flex-col items-center justify-center gap-2">
              <CreditCard className="w-16 h-16" />
              <span className="font-bold">IC 카드</span>
            </div>
            <div className="border-4 border-dashed border-black/20 h-40 rounded-3xl flex flex-col items-center justify-center bg-gray-50">
              <div className="w-16 h-24 relative">
                <img src="/payment-terminal.png" alt="Terminal" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-full bg-pink-50 absolute inset-0 flex flex-col items-center justify-center text-center p-8"
        >
          <div className="bg-white p-16 rounded-[3rem] shadow-2xl w-full max-w-2xl space-y-10 border-4 border-white ring-4 ring-pink-100">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
              <CheckCircle2 className="w-32 h-32 text-green-500 mx-auto drop-shadow-lg" />
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-gray-600 mb-4">결제가 완료되었습니다</h2>
              <div className="bg-gray-50 rounded-3xl py-8 border border-gray-100">
                <p className="text-xl text-gray-500 mb-2">주문번호</p>
                <p className="text-8xl font-black text-pink-600 tracking-tighter">{orderNum}</p>
              </div>
            </div>

            <p className="text-gray-400 font-medium animate-pulse">잠시 후 초기화면으로 돌아갑니다</p>

            <div className="w-full bg-gray-100 rounded-2xl h-48 overflow-hidden relative shadow-inner">
              <img src="/advertisement-kpop-style-drink.jpg" alt="Ad" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="text-white font-bold text-xl drop-shadow-md">신메뉴 출시! 스파클링 제로</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <HomeButton />
    </div>
  )
}

