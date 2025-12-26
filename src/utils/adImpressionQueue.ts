import { api } from '../Lib/api';

export type AdImpressionLog = {
  adId: number;
  displayedAt: string; // LocalDateTime string without timezone
  durationMs: number; // integer ms
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
    // If storage fails, we still allow runtime to proceed.
  }
}

/**
 * At-least-once impression log queue.
 * - Always persists to localStorage before attempting to flush
 * - Allows duplicates (acceptable by requirement)
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
   * Flush queued logs in FIFO order.
   * - Stops on first failure (keeps remaining items)
   */
  async flush(): Promise<void> {
    if (flushing) return;
    flushing = true;

    try {
      // Loop with fresh reads to keep storage the source of truth.
      // This makes it resilient if multiple tabs exist.
      while (true) {
        const head = adImpressionQueue.peek();
        if (!head) break;

        try {
          await api.post('/api/ads/display-log', head);
          adImpressionQueue.removeFirst();
        } catch {
          // Network/server failure: keep the item for later.
          break;
        }
      }
    } finally {
      flushing = false;
    }
  },
};
