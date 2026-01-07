// components/FaceAnalysisScreen.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalysisStore } from '../store/analysisStore';

type Screen = 'waiting' | 'result';

interface AnalysisData {
  age: number | string;
  gender: string;
  timestamp: string;
}

interface SystemStatus {
  status?: string;
  has_data?: boolean;
  is_analyzing?: boolean;
  face_detected?: boolean;
}

// const AI_CORE_BASE_URL =
//   (import.meta.env.VITE_AI_CORE_URL as string | undefined) ??
//   (import.meta.env.VITE_API_URL as string | undefined) ??
//   'http://127.0.0.1:8000/nok-nok';
const AI_CORE_BASE_URL = 'http://localhost:8000/nok-nok';

export default function FaceAnalysisScreen() {
  const setAnalysis = useAnalysisStore((s) => s.setAnalysis);

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('waiting');

  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE 콜백에서 최신 상태를 보기 위한 ref
  const currentScreenRef = useRef<Screen>('waiting');
  const loadingRef = useRef(false);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const checkStatusOnce = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${AI_CORE_BASE_URL}/api/status`);
      if (!response.ok) return;
      const data: SystemStatus = await response.json();
      setSystemStatus(data);
    } catch (err) {
      console.error('상태 확인 실패:', err);
    }
  }, []);

  const disconnectSSE = useCallback((): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const fetchAnalysis = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`);

      if (response.ok) {
        const data: AnalysisData = await response.json();
        setAnalysisData(data);
        setAnalysis(data);
        setError(null);
        setCurrentScreen('result');
        return;
      }

      setError('아직 분석된 데이터가 없습니다. 카메라 앞에서 잠시 기다려주세요.');
    } catch (err) {
      setError('서버 연결 실패. ai-core(DeepFace)가 실행 중인지 확인하세요.');
      console.error('데이터 가져오기 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [setAnalysis]);

  const connectSSE = useCallback((): void => {
    disconnectSSE();

    const eventSource = new EventSource(`${AI_CORE_BASE_URL}/api/stream/status`);

    eventSource.onmessage = (event: MessageEvent<string>) => {
      try {
        const data: SystemStatus = JSON.parse(event.data);
        setSystemStatus(data);

        const isWaiting = currentScreenRef.current === 'waiting';
        const isBusy = loadingRef.current;

        if (data.has_data && !data.is_analyzing && isWaiting && !isBusy) {
          void fetchAnalysis();
        }
      } catch (err) {
        console.error('SSE 데이터 파싱 실패:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE 연결 오류:', err);
      eventSource.close();

      window.setTimeout(() => {
        if (currentScreenRef.current === 'waiting') {
          connectSSE();
        }
      }, 3000);
    };

    eventSourceRef.current = eventSource;
  }, [disconnectSSE, fetchAnalysis]);

  const returnToWaiting = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${AI_CORE_BASE_URL}/api/analysis`, { method: 'DELETE' });
    } catch (err) {
      console.error('데이터 초기화 실패:', err);
    }

    setCurrentScreen('waiting');
    setAnalysisData(null);
    setError(null);
    setSystemStatus(null);
  }, []);

  useEffect(() => {
    if (currentScreen === 'waiting') {
      connectSSE();
      return () => {
        disconnectSSE();
      };
    }

    if (currentScreen === 'result') {
      disconnectSSE();
      void checkStatusOnce();
    }

    return;
  }, [checkStatusOnce, connectSSE, currentScreen, disconnectSSE]);

  return (
    <div className="w-full h-full min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-extrabold text-gray-900">얼굴 분석</h1>
          <div className="text-sm text-gray-500">상태: {systemStatus?.status ?? '-'}</div>
        </div>

        {currentScreen === 'waiting' && (
          <div className="mt-6 space-y-3">
            <div className="text-gray-700">카메라 앞에서 잠시 기다려주세요.</div>
            <div className="text-sm text-gray-500">
              face_detected: {String(systemStatus?.face_detected ?? false)} / is_analyzing:{' '}
              {String(systemStatus?.is_analyzing ?? false)}
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              type="button"
              className="w-full rounded-xl bg-gray-900 text-white font-bold py-3 disabled:opacity-50"
              onClick={() => void fetchAnalysis()}
              disabled={loading}
            >
              {loading ? '불러오는 중...' : '결과 가져오기'}
            </button>
          </div>
        )}

        {currentScreen === 'result' && (
          <div className="mt-6 space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!error && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500">나이</div>
                  <div className="text-lg font-bold text-gray-900">{analysisData?.age ?? '-'}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500">성별</div>
                  <div className="text-lg font-bold text-gray-900">
                    {analysisData?.gender ?? '-'}
                  </div>
                </div>
                <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500">timestamp</div>
                  <div className="text-sm font-mono text-gray-800">
                    {analysisData?.timestamp ?? '-'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl bg-gray-100 text-gray-900 font-bold py-3"
                onClick={() => void returnToWaiting()}
              >
                다시 대기
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-gray-900 text-white font-bold py-3 disabled:opacity-50"
                onClick={() => void fetchAnalysis()}
                disabled={loading}
              >
                {loading ? '불러오는 중...' : '다시 조회'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}