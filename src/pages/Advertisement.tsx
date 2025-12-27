import { type TransitionEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../hooks/useAds';
import type { Ad } from '../types/ad';
import { toLocalDateTimeString } from '../utils/localDateTime';
import { adImpressionQueue } from '../utils/adImpressionQueue';

const ROTATE_INTERVAL_MS = 10_000;
const TRANSITION_DURATION_MS = 550; // 400~700ms 범위
const EXIT_GUARD_MS = 400; // 300~500ms 범위

function renderAd(ad: Ad) {
  if (ad.mediaType === 'VIDEO') {
    return (
      <video
        className="w-full h-full object-cover"
        src={ad.mediaUrl}
        autoPlay
        muted
        playsInline
        preload="auto"
      />
    );
  }

  return (
    <img
      className="w-full h-full object-cover"
      src={ad.mediaUrl}
      alt={ad.title}
      draggable={false}
    />
  );
}

/**
 * Fullscreen Advertisement page.
 * - Renders only (current + next) for perf
 * - Slides using translate3d transforms
 * - Sends impression logs at the moment the current ad definitively ends
 * - Any user input/presence exits immediately to /order
 */
export default function Advertisement() {
  const navigate = useNavigate();
  const { ads } = useAds();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const rotateTimerIdRef = useRef<number | null>(null);
  const ignoreInputUntilRef = useRef<number>(0);
  const finalizedRef = useRef(false);
  const transitionEndHandledRef = useRef(false);

  // Current ad timing refs
  const displayedAtRef = useRef<string>('');
  const displayStartPerfRef = useRef<number>(0);
  const displayedAdIdRef = useRef<number | null>(null);

  const hasAds = ads.length > 0;

  const nextIndex = useMemo(() => {
    if (ads.length <= 1) return 0;
    return (currentIndex + 1) % ads.length;
  }, [ads.length, currentIndex]);

  const currentAd = hasAds ? ads[currentIndex] : null;
  const nextAd = ads.length >= 2 ? ads[nextIndex] : null;

  const clearRotateTimer = useCallback(() => {
    if (rotateTimerIdRef.current != null) {
      window.clearTimeout(rotateTimerIdRef.current);
      rotateTimerIdRef.current = null;
    }
  }, []);

  const startCurrentAdTiming = useCallback((ad: Ad) => {
    displayedAtRef.current = toLocalDateTimeString();
    displayStartPerfRef.current = performance.now();
    displayedAdIdRef.current = ad.adId;
  }, []);

  /**
   * Finalize the *currently tracked* impression immediately.
   * - Uses refs captured at the time the ad started displaying
   * - Enqueues + flushes in background (UI must not wait)
   */
  const finalizeCurrentImpression = useCallback(() => {
    const adId = displayedAdIdRef.current;
    const displayedAt = displayedAtRef.current;
    const startedAtPerf = displayStartPerfRef.current;

    if (adId == null || !displayedAt || !startedAtPerf) return;

    const durationMs = Math.max(0, Math.round(performance.now() - startedAtPerf));

    adImpressionQueue.add({
      adId,
      displayedAt,
      durationMs,
    });

    // Flush on every attempt; it will stop on first failure.
    void adImpressionQueue.flush();
  }, []);

  const startRotateTimer = useCallback(() => {
    clearRotateTimer();

    if (ads.length <= 1) return;

    rotateTimerIdRef.current = window.setTimeout(() => {
      // Prevent overlapping transitions (use functional update to avoid stale closures)
      transitionEndHandledRef.current = false;
      setIsTransitioning((prev) => (prev ? prev : true));
    }, ROTATE_INTERVAL_MS);
  }, [ads.length, clearRotateTimer]);

  // Only animate while actually transitioning; otherwise snap instantly.
  const transitionCss = isTransitioning
    ? `transform ${TRANSITION_DURATION_MS}ms ease-in-out`
    : 'none';

  const preloadNext = useCallback((ad: Ad | null) => {
    if (!ad) return;

    if (ad.mediaType === 'IMAGE') {
      const img = new Image();
      img.src = ad.mediaUrl;
      return;
    }

    // For video, preload="auto" on the rendered <video> covers the typical preload behavior.
    // We avoid creating hidden <video> elements to keep things simple.
  }, []);

  const exitToOrder = useCallback(async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;

    clearRotateTimer();

    // Current ad ends immediately at exit moment.
    finalizeCurrentImpression();
    navigate('/order');
  }, [clearRotateTimer, finalizeCurrentImpression, navigate]);

  // On enter: guard against immediate accidental exit + flush any previous queue.
  useEffect(() => {
    ignoreInputUntilRef.current = performance.now() + EXIT_GUARD_MS;

    // Try to flush any queued logs when entering.
    adImpressionQueue.flush();

    return () => {
      clearRotateTimer();
    };
  }, [clearRotateTimer]);

  // Handle "no ads" rule: auto navigate to /order after 2 seconds.
  useEffect(() => {
    if (ads.length !== 0) return;

    const t = window.setTimeout(() => {
      navigate('/order');
    }, 2000);

    return () => window.clearTimeout(t);
  }, [ads.length, navigate]);

  // Initialize timing when ads load / when current ad becomes available.
  useEffect(() => {
    if (!currentAd) return;
    // Reset finalization on fresh mount where ads exist.
    finalizedRef.current = false;

    setCurrentIndex(0);
    setIsTransitioning(false);

    startCurrentAdTiming(currentAd);
    preloadNext(nextAd);
    startRotateTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads.length]);

  // Whenever currentIndex changes (after a completed transition), restart timing/timer.
  useEffect(() => {
    if (!currentAd) return;
    startCurrentAdTiming(currentAd);
    preloadNext(nextAd);
    startRotateTimer();
  }, [currentAd, nextAd, preloadNext, startCurrentAdTiming, startRotateTimer]);

  // Exit on user input/presence (with entry guard).
  useEffect(() => {
    const shouldIgnore = () => performance.now() < ignoreInputUntilRef.current;

    const onExitEvent = () => {
      if (shouldIgnore()) return;
      void exitToOrder();
    };

    window.addEventListener('pointerdown', onExitEvent);
    window.addEventListener('presence', onExitEvent);

    return () => {
      window.removeEventListener('pointerdown', onExitEvent);
      window.removeEventListener('presence', onExitEvent);
    };
  }, [exitToOrder]);

  const onTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'transform') return;
      if (!isTransitioning) return;
      if (transitionEndHandledRef.current) return;
      transitionEndHandledRef.current = true;

      // Current ad is definitively ended *now*.
      finalizeCurrentImpression();

      // Update index immediately so the next cycle is always forward.
      setCurrentIndex((prev) => {
        if (ads.length <= 1) return prev;
        return (prev + 1) % ads.length;
      });
      setIsTransitioning(false);
    },
    [ads.length, finalizeCurrentImpression, isTransitioning]
  );

  // Nothing to render while ads are empty or still loading; requirements say full screen with no overlays.
  if (!currentAd) {
    // Keep the same rotated kiosk wrapper so layout stays consistent.
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
        <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-black" />
      </div>
    );
  }

  // Render only current + next (2 layers) and slide via transform.
  return (
    // Same rotation wrapper used by Order.tsx
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-black">
        <div className="w-full h-full overflow-hidden relative">
          {/* Current */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: isTransitioning ? 'translate3d(-100%, 0, 0)' : 'translate3d(0, 0, 0)',
              transition: transitionCss,
            }}
          >
            {renderAd(currentAd)}
          </div>

          {/* Next */}
          {nextAd && (
            <div
              className="absolute inset-0 will-change-transform"
              style={{
                transform: isTransitioning ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
                transition: transitionCss,
              }}
              onTransitionEnd={onTransitionEnd}
            >
              {renderAd(nextAd)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
