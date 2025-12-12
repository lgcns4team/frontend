import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Order from './pages/Order';
import EasyOrder from './pages/EasyOrder';
import EasyConfirm from './pages/EasyConfirm';
import VoiceOrder from "./pages/VoiceOrder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Order />} /> {/* 일단 홈도 Order로 설정 */}
        <Route path="/order" element={<Order />} />
        <Route path="/easy" element={<EasyOrder />} />
        <Route path="/easy/confirm" element={<EasyConfirm />} />
        {/* 추후 추가 */}
        <Route path="/voice" element={<VoiceOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
