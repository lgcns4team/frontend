// hooks/useFaceDetection.ts
import { useEffect, useState, useCallback, useRef } from 'react';

interface FaceDetectionStatus {
  status: string;
  is_analyzing: boolean;
  face_detected: boolean;
  has_data: boolean;
  depth_threshold?: number;
  cooldown_period?: number;
}

interface FaceAnalysisData {
  age: number;
  gender: string;
  timestamp: string;
}

// const AI_CORE_BASE_URL =
//   (import.meta.env.VITE_AI_CORE_URL as string | undefined) ??
//   (import.meta.env.VITE_API_URL as string | undefined) ??
//   'http://localhost:8000/nok-nok';
const AI_CORE_BASE_URL = 'http://localhost:8000/nok-nok';

export function useFaceDetection(shouldAutoConnect: boolean = true) {
  const [status, setStatus] = useState<FaceDetectionStatus | null>(null);
  const [analysisData, setAnalysisData] = useState<FaceAnalysisData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isFetchingRef = useRef(false);
  const initializedRef = useRef(false);

  // 분석 데이터 가져오기
  const fetchAnalysis = useCallback(async (): Promise<FaceAnalysisData | null> => {
    if (isFetchingRef.current) return null;
    
    isFetchingRef.current = true;
    try {
      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`);
      
      if (response.ok) {
        const data: FaceAnalysisData = await response.json();
        console.log('📥 새로운 얼굴 인식 데이터 수신:', data);
        setAnalysisData(data);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('분석 데이터 가져오기 실패:', err);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // 분석 데이터 초기화
  const clearAnalysis = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`, { method: 'DELETE' });
      if (response.ok) {
        console.log('🗑️ 서버 분석 데이터 초기화 완료');
      }
      setAnalysisData(null);
    } catch (err) {
      console.error('데이터 초기화 실패:', err);
    }
  }, []);

  // 로컬 상태만 초기화 (서버 호출 없이)
  const resetLocalState = useCallback((): void => {
    console.log('🔄 로컬 상태 초기화');
    setAnalysisData(null);
    setStatus(null);
  }, []);

  // 컴포넌트 마운트 시 이전 데이터 초기화
  useEffect(() => {
    if (!initializedRef.current && shouldAutoConnect) {
      initializedRef.current = true;
      console.log('🔄 광고 화면 진입: 이전 얼굴 인식 데이터 초기화');
      void clearAnalysis();
    }
  }, [clearAnalysis, shouldAutoConnect]);

  // SSE 연결
  useEffect(() => {
    if (!shouldAutoConnect) {
      return;
    }

    const connectSSE = () => {
      // 기존 연결 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`${AI_CORE_BASE_URL}/api/stream/status`);

      eventSource.onopen = () => {
        console.log('✅ SSE 연결 성공');
        setIsConnected(true);
      };

      eventSource.onmessage = (event: MessageEvent<string>) => {
        try {
          const data: FaceDetectionStatus = JSON.parse(event.data);
          setStatus(data);

          // 얼굴 분석 완료 시 자동으로 데이터 가져오기
          if (data.has_data && !data.is_analyzing && !isFetchingRef.current) {
            void fetchAnalysis();
          }
        } catch (err) {
          console.error('SSE 데이터 파싱 실패:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('❌ SSE 연결 오류:', err);
        setIsConnected(false);
        eventSource.close();

        // 3초 후 재연결 시도
        setTimeout(() => {
          console.log('🔄 SSE 재연결 시도...');
          connectSSE();
        }, 3000);
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [fetchAnalysis, shouldAutoConnect]);

  return {
    status,
    analysisData,
    isConnected,
    fetchAnalysis,
    clearAnalysis,
    resetLocalState,
  };
}