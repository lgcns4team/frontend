import { Routes, Route } from 'react-router-dom'
import AdScreen from './pages/AdScreen'
import Order from './pages/Order'
import Voice from './pages/Voice'
import Payment from './pages/Payment'
import Easy from './pages/Easy'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdScreen />} />
        <Route path="/order" element={<Order />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/easy" element={<Easy />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App

