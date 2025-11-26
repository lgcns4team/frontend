// src/components/HomeButton.tsx
import { Home } from 'lucide-react';
import { HomeButton } from '../components/HomeButton';

type HomeButtonProps = {
  onClick?: () => void;
};

export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 flex items-center gap-2 px-5 py-3 rounded-full bg-white/90 shadow-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition"
    >
      <Home className="w-5 h-5 text-slate-700" />
      <span className="text-sm font-bold text-slate-700">처음으로</span>
    </button>
  );
}

export default HomeButton;
