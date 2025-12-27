import { api } from '../Lib/api';

export type AdImpressionLog = {
  adId: number;
  displayedAt: string; // 타임존 없는 LocalDateTime 문자열
  durationMs: number; // 밀리초 정수(ms)
};

const STORAGE_KEY = 'ad_impression_queue';

let flushing = false;

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

function writeQueue(queue: AdImpressionLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // 스토리지 저장이 실패해도 런타임은 계속 진행합니다.
  }
}

/**
 * 최소 1회(at-least-once) 노출 로그 큐.
 * - flush 시도 전에 항상 localStorage에 먼저 저장합니다.
 * - 중복 전송을 허용합니다(요구사항상 허용).
 */
export const adImpressionQueue = {
  add(item: AdImpressionLog) {
    const queue = readQueue();
    queue.push(item);
    writeQueue(queue);
  },

  removeFirst() {
    const queue = readQueue();
    queue.shift();
    writeQueue(queue);
  },

  peek(): AdImpressionLog | null {
    const queue = readQueue();
    return queue.length > 0 ? queue[0] : null;
  },

  size(): number {
    return readQueue().length;
  },

  /**
   * 큐에 쌓인 로그를 FIFO 순서로 전송(flush)합니다.
   * - 첫 실패에서 중단합니다(남은 항목은 유지).
   */
  async flush(): Promise<void> {
    if (flushing) return;
    flushing = true;

    try {
      // 매 반복마다 storage를 다시 읽어, storage를 단일 진실 소스로 유지합니다.
      // 여러 탭이 동시에 열려 있어도 견고하게 동작합니다.
      while (true) {
        const head = adImpressionQueue.peek();
        if (!head) break;

        try {
          await api.post('/api/ads/display-log', head);
          adImpressionQueue.removeFirst();
        } catch {
          // 네트워크/서버 실패 시: 항목을 유지하고 나중에 재시도합니다.
          break;
        }
      }
    } finally {
      flushing = false;
    }
  },
};
