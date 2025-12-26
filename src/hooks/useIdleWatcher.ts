import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIdleStore } from '../store/idleStore';

const IDLE_THRESHOLD_MS = 60_000;
const IDLE_CHECK_INTERVAL_MS = 300;

/**
 * App-level idle watcher.
 *
 * Activity events:
 * - window `pointerdown`
 * - window custom `presence` (dispatched via window.dispatchEvent(new Event('presence')))
 *
 * Behavior:
 * - If now - lastActive >= 60s and pathname !== '/advertisement', navigate('/advertisement')
 * - Immediately after navigating to '/advertisement', markActive() to avoid re-entry
 */
export function useIdleWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const lastActive = useIdleStore((s) => s.lastActive);
  const markActive = useIdleStore((s) => s.markActive);
  const setIdle = useIdleStore((s) => s.setIdle);

  useEffect(() => {
    const onActivity = () => {
      markActive();
    };

    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('presence', onActivity);

    const intervalId = window.setInterval(() => {
      // IMPORTANT: Do not navigate while already on /advertisement
      if (location.pathname === '/advertisement') {
        setIdle(false);
        return;
      }

      const now = Date.now();
      const idleNow = now - lastActive >= IDLE_THRESHOLD_MS;

      if (idleNow) {
        setIdle(true);
        navigate('/advertisement');
        // Prevent immediate re-entry and satisfy requirement to update lastActive after navigate.
        markActive();
      } else {
        setIdle(false);
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('presence', onActivity);
      window.clearInterval(intervalId);
    };
  }, [lastActive, location.pathname, markActive, navigate, setIdle]);
}
