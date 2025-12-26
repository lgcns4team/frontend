import { create } from 'zustand';

type IdleState = {
  lastActive: number;
  idle: boolean;
  markActive: () => void;
  setIdle: (idle: boolean) => void;
};

/**
 * Global idle state.
 * - lastActive is measured with Date.now() (ms)
 * - idle is derived in the watcher but stored for visibility/debugging
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
