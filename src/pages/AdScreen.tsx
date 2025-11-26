import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function AdScreen() {
  const navigate = useNavigate()

  return (
    <div
      className="relative w-[540px] h-[900px] mx-auto bg-black overflow-hidden cursor-pointer select-none shadow-2xl my-10"
      onClick={() => navigate("/order")}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
        <img
          src="/ad-cafe.jpg"
          alt="Advertisement"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
      </motion.div>

      <div className="absolute bottom-32 left-0 right-0 text-center text-white space-y-6 z-10">
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <div className="relative w-12 h-12 opacity-80 invert">
              <img src="/touch-icon-white.jpg" alt="Touch" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-wider drop-shadow-lg">주문하시려면 화면을 터치해주세요</h1>
          <p className="text-2xl text-gray-300 font-light tracking-widest uppercase">Touch to Order</p>
        </div>
      </div>

      {/* Brand Logo Placeholder */}
      <div className="absolute top-12 left-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">QB</span>
        </div>
        <span className="text-white font-bold text-2xl tracking-tight drop-shadow-md">QuickBite</span>
      </div>
    </div>
  )
}

