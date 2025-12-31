import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIdleStore } from '../store/idleStore';

const IDLE_THRESHOLD_MS = 60_000;
const IDLE_CHECK_INTERVAL_MS = 300;

/**
 * 앱 레벨 유휴(idle) 감시 훅.
 *
 * 활동 이벤트:
 * - window `pointerdown`
 * - window 커스텀 `presence` (window.dispatchEvent(new Event('presence')) 로 발생)
 *
 * 동작:
 * - now - lastActive >= 60s 이고 pathname !== '/advertisement' 이면 navigate('/advertisement')
 * - '/advertisement'로 이동 직후 markActive()를 호출해 즉시 재진입을 방지
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
      // 중요: 이미 /advertisement에 있으면 이동하지 않음
      if (location.pathname === '/advertisement') {
        setIdle(false);
        return;
      }

      const now = Date.now();
      const idleNow = now - lastActive >= IDLE_THRESHOLD_MS;

      if (idleNow) {
        setIdle(true);
        navigate('/advertisement');
        // 즉시 재진입을 방지하고, 이동 후 lastActive 갱신 요구사항을 충족합니다.
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
