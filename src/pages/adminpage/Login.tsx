import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/Button';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 👉 일단은 간단한 더미 로그인 로직 (나중에 실제 API 붙이면 됨)
    if (id === 'admin' && password === '1234') {
      setError('');
      onLoginSuccess();
    } else {
      setError('아이디 또는 비밀번호를 다시 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-slate-900">관리자 로그인</h1>
          <p className="text-sm text-slate-500">매장 관리자 전용 대시보드입니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">아이디</label>
            <Input
              type="text"
              placeholder="admin"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <Button type="submit" className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800">
            로그인
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center">
          데모용 계정: ID <span className="font-mono">admin</span> / PW{' '}
          <span className="font-mono">1234</span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
