// utils/fetchLatestAnalysis.ts

// const AI_CORE_BASE_URL =
//   (import.meta.env.VITE_AI_CORE_URL as string | undefined) ??
//   (import.meta.env.VITE_API_URL as string | undefined) ??
//   'http://127.0.0.1:8000/nok-nok';
const AI_CORE_BASE_URL = 'http://localhost:8000/nok-nok';

interface AnalysisData {
  age: number;
  gender: string;
  timestamp: string;
}

/**
 * Python 서버에서 가장 최근에 인식한 얼굴 분석 데이터를 가져옵니다.
 * @returns 분석 데이터 또는 null (데이터 없음)
 */
export async function fetchLatestAnalysis(): Promise<AnalysisData | null> {
  try {
    const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`);

    if (response.ok) {
      const data: AnalysisData = await response.json();
      console.log('📥 최신 얼굴 인식 데이터 가져오기 성공:', data);
      return data;
    }

    if (response.status === 404) {
      console.log('ℹ️ 얼굴 인식 데이터 없음 (404)');
      return null;
    }

    console.warn('⚠️ 얼굴 인식 데이터 가져오기 실패:', response.status);
    return null;
  } catch (err) {
    console.error('❌ 얼굴 인식 데이터 가져오기 오류:', err);
    return null;
  }
}

/**
 * Python 서버의 얼굴 분석 데이터를 초기화합니다.
 */
export async function clearAnalysisOnServer(): Promise<void> {
  try {
    const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`, { method: 'DELETE' });
    if (response.ok) {
      console.log('🗑️ 서버 분석 데이터 초기화 완료');
    }
  } catch (err) {
    console.error('❌ 서버 분석 데이터 초기화 실패:', err);
  }
}