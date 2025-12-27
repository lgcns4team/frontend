import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Order from './pages/Order';
import Payment from './pages/Payment';
import EasyOrder from './pages/EasyOrder';
import EasyConfirm from './pages/EasyConfirm';
import VoiceOrder from './pages/VoiceOrder';
import Advertisement from './pages/Advertisement';
import './index.css';
import { useIdleWatcher } from './hooks/useIdleWatcher';
import './index.css';
import EasyPayment from './pages/EasyPayment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Order />} /> {/* 일단 홈도 Order로 설정 */}
        <Route path="/order" element={<Order />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/easy" element={<EasyOrder />} />
        <Route path="/easy/confirm" element={<EasyConfirm />} />
        {/* 추후 추가 */}
        <Route path="/voice" element={<VoiceOrder />} />
        <Route path="/easy-payment" element={<EasyPayment />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppRoutes() {
  // Global idle watcher must run inside Router context.
  useIdleWatcher();

  return (
    <Routes>
      <Route path="/" element={<Order />} /> {/* 일단 홈도 Order로 설정 */}
      <Route path="/order" element={<Order />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/easy" element={<EasyOrder />} />
      <Route path="/easy/confirm" element={<EasyConfirm />} />
      <Route path="/voice" element={<VoiceOrder />} />
      <Route path="/advertisement" element={<Advertisement />} />
    </Routes>
  );
}

export default App;
