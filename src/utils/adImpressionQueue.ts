import { apiClient } from '../api/ApiClient';

/**
 * 광고 노출 로그 항목
 *
 * 사용자가 광고를 본 시간, 노출 시간 등을 기록합니다.
 */
export type AdImpressionLog = {
  adId: number; // 광고 ID
  displayedAt: string; // 표시된 시각 (타임존 없는 LocalDateTime 문자열: YYYY-MM-DD HH:mm:ss.SSS)
  durationMs: number; // 표시 지속 시간 (밀리초 단위)
};

// 로컬 스토리지 키
const STORAGE_KEY = 'ad_impression_queue';

// 플러시 진행 중 플래그 (중복 전송 방지)
let flushing = false;

/**
 * 로컬 스토리지에서 광고 노출 로그 큐를 읽습니다.
 * @returns 저장된 로그 배열
 */
function readQueue(): AdImpressionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AdImpressionLog[];
  } catch {
    return [];
  }
}

/**
 * 광고 노출 로그 큐를 로컬 스토리지에 저장합니다.
 * @param queue - 저장할 로그 배열
 */
function writeQueue(queue: AdImpressionLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // 스토리지 저장 실패 시에도 런타임은 계속 진행
  }
}

/**
 * 광고 노출 로그 큐 관리 객체
 *
 * "최소 1회(at-least-once) 배달" 패턴 구현:
 * - 로컬 스토리지를 단일 진실 소스로 사용
 * - 네트워크 실패 시 재시도 가능 (로그 유지)
 * - 여러 탭이 동시에 열려있어도 안전 (중복 전송 방지)
 */
export const adImpressionQueue = {
  /**
   * 광고 노출 로그를 큐에 추가합니다.
   * @param item - 추가할 로그
   */
  add(item: AdImpressionLog) {
    const queue = readQueue();
    queue.push(item);
    writeQueue(queue);
  },

  /**
   * 큐의 맨 앞 항목을 제거합니다.
   */
  removeFirst() {
    const queue = readQueue();
    queue.shift();
    writeQueue(queue);
  },

  /**
   * 큐의 맨 앞 항목을 조회합니다 (제거하지 않음).
   * @returns 첫 번째 로그 또는 null
   */
  peek(): AdImpressionLog | null {
    const queue = readQueue();
    return queue.length > 0 ? queue[0] : null;
  },

  /**
   * 현재 큐에 있는 로그 개수를 반환합니다.
   * @returns 로그 개수
   */
  size(): number {
    return readQueue().length;
  },

  /**
   * 큐에 쌓인 로그를 백엔드로 전송합니다.
   *
   * 동작 방식:
   * - FIFO 순서로 하나씩 전송
   * - 전송 성공 시 로그 삭제
   * - 전송 실패 시 해당 로그부터 재시도 (그 이후 로그는 대기)
   * - 중복 호출 방지 (flushing 플래그)
   *
   * 네트워크가 불안정해도 안전:
   * - 로컬 스토리지에 항상 최신 상태 유지
   * - 여러 탭이 동시에 실행되어도 문제없음
   */
  async flush(): Promise<void> {
    // 이미 플러시 진행 중이면 대기
    if (flushing) return;
    flushing = true;

    try {
      // 로그 전송 루프
      while (true) {
        const head = adImpressionQueue.peek();
        if (!head) break; // 큐가 비었으면 종료

        try {
          // 백엔드로 노출 로그 전송
          await apiClient.post('/ads/display-log', head);
          // 전송 성공 시 로그 제거
          adImpressionQueue.removeFirst();
        } catch {
          // 네트워크/서버 에러: 로그를 유지하고 다음 재시도를 기다립니다
          break;
        }
      }
    } finally {
      flushing = false;
    }
  },
};
