'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const HOURLY_DATA = [
  { time: '09시', orders: 12 },
  { time: '10시', orders: 18 },
  { time: '11시', orders: 35 },
  { time: '12시', orders: 42 },
  { time: '13시', orders: 28 },
  { time: '14시', orders: 15 },
];

const MENU_DATA = [
  { name: '아메리카노', value: 45 },
  { name: '라떼', value: 32 },
  { name: '에이드', value: 28 },
  { name: '스무디', value: 15 },
  { name: '티', value: 10 },
];

const PIE_DATA = [
  { name: '성공', value: 123, color: '#4ade80' },
  { name: '실패', value: 1, color: '#ef4444' },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">관리자 대시보드</h1>
            <p className="text-slate-500 mt-1">실시간 매장 현황 및 매출 분석</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200">
              {new Date().toLocaleDateString()} 기준
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 border border-red-100"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">오늘 주문</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">124건</div>
              <p className="text-xs text-green-600 font-medium mt-1">+20.1% 어제 대비 증가</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">오늘 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">1,245,000원</div>
              <p className="text-xs text-green-600 font-medium mt-1">+15% 목표 달성</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">기기 상태</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                1 <span className="text-xl text-slate-400 font-normal">/ 2대</span>
              </div>
              <p className="text-xs text-red-500 font-bold mt-1">키오스크 #2 연결 끊김</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">시스템 오류</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">1건</div>
              <p className="text-xs text-slate-400 mt-1">결제 모듈 타임아웃 (14:30)</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">시간대별 주문 추이</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HOURLY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">인기 메뉴 TOP 5</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MENU_DATA}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">결제 성공률</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">99.2%</span>
                <span className="text-xs text-slate-400">성공률</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">최근 시스템 알림</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 transition-all hover:bg-red-100 cursor-pointer">
                  <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">[14:30:22] 카드 단말기(ID: 202) 응답 없음</p>
                    <p className="text-sm text-red-600/80 mt-1">
                      연결이 3회 이상 실패했습니다. 네트워크 상태를 점검해주세요.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100 transition-all hover:bg-yellow-100 cursor-pointer">
                  <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">[13:15:00] 영수증 용지 부족 경고</p>
                    <p className="text-sm text-yellow-700/80 mt-1">
                      키오스크 #1 프린터 용지 잔량이 10% 미만입니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 transition-all hover:bg-blue-100 cursor-pointer">
                  <CheckCircle className="w-6 h-6 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">[09:00:00] 시스템 정기 점검 완료</p>
                    <p className="text-sm text-blue-700/80 mt-1">
                      모든 모듈이 정상적으로 초기화되었습니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
