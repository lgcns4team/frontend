import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Order from './pages/Order';
import Payment from './pages/Payment';
import EasyOrder from './pages/EasyOrder';
import EasyConfirm from './pages/EasyConfirm';
import VoiceOrder from './pages/VoiceOrder';
import Advertisement from './pages/Advertisement';
import './index.css';
import { useIdleWatcher } from './hooks/useIdleWatcher';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  // 전역 유휴(idle) 감시는 Router 컨텍스트 안에서 실행되어야 합니다.
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

