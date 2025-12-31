import { create } from 'zustand';

type IdleState = {
  lastActive: number;
  idle: boolean;
  markActive: () => void;
  setIdle: (idle: boolean) => void;
};

/**
 * 전역 유휴(idle) 상태.
 * - lastActive는 Date.now() 기준(ms)으로 측정합니다.
 * - idle은 watcher에서 계산되지만, 확인/디버깅을 위해 상태로 보관합니다.
 */
export const useIdleStore = create<IdleState>((set) => ({
  lastActive: Date.now(),
  idle: false,
  markActive: () =>
    set(() => ({
      lastActive: Date.now(),
      idle: false,
    })),
  setIdle: (idle) => set(() => ({ idle })),
}));
