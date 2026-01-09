import { type TransitionEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../hooks/useAds';
import type { Ad } from '../types/ad';
import { toLocalDateTimeString } from '../utils/localDateTime';
import { adImpressionQueue } from '../utils/adImpressionQueue';
import { useAnalysisStore } from '../store/analysisStore';

const ROTATE_INTERVAL_MS = 10_000;
const TRANSITION_DURATION_MS = 550;
const EXIT_GUARD_MS = 0; // 클릭 시 즉시 반응 (기존 400ms 제거)

const NEXT_MEDIA_MAX_WAIT_MS = 5_000;
const NEXT_MEDIA_RETRY_MS = 300;

// Face analysis backend base URL (must include /nok-nok prefix when applicable)
const AI_CORE_BASE_URL = 'http://127.0.0.1:8000/nok-nok';

type MediaMarkHandlers = {
  onReady?: () => void;
  onError?: () => void;
};

function renderAd(ad: Ad, handlers?: MediaMarkHandlers) {
  if (ad.mediaType === 'VIDEO') {
    return (
      <video
        className="w-full h-full object-cover"
        src={ad.mediaUrl}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={handlers?.onReady}
        onCanPlay={handlers?.onReady}
        onError={handlers?.onError}
      />
    );
  }

  return (
    <img
      className="w-full h-full object-contain"
      src={ad.mediaUrl}
      alt={ad.title}
      draggable={false}
      onLoad={handlers?.onReady}
      onError={handlers?.onError}
    />
  );
}

/**
 * Fullscreen Advertisement page with face detection integration.
 * - SSE로 백엔드 상태를 실시간 감시
 * - has_data=true 감지 시 자동으로 /order로 이동
 * - 광고 노출 로그 기록
 * - 처음으로 버튼에서 설정한 데이터는 유지
 */
export default function Advertisement() {
  const navigate = useNavigate();
  const { ads } = useAds();

  const setAnalysis = useAnalysisStore((s) => s.setAnalysis);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const rotateTimerIdRef = useRef<number | null>(null);
  const ignoreInputUntilRef = useRef<number>(0);
  const finalizedRef = useRef(false);
  const transitionEndHandledRef = useRef(false);

  const mediaReadyUrlsRef = useRef<Set<string>>(new Set());
  const mediaFailedUrlsRef = useRef<Set<string>>(new Set());
  const mediaPreloadVideoRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const waitingForNextSincePerfRef = useRef<number | null>(null);

  // Current ad timing refs
  const displayedAtRef = useRef<string>('');
  const displayStartPerfRef = useRef<number>(0);
  const displayedAdIdRef = useRef<number | null>(null);

  // 🆕 SSE 연결 관련
  const eventSourceRef = useRef<EventSource | null>(null);
  const sseConnectedRef = useRef(false);
  const initializedRef = useRef(false);

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

    void adImpressionQueue.flush();
  }, []);

  const preloadNext = useCallback((ad: Ad | null) => {
    if (!ad) return;

    const url = ad.mediaUrl;
    if (!url) return;
    if (mediaReadyUrlsRef.current.has(url) || mediaFailedUrlsRef.current.has(url)) return;

    if (ad.mediaType === 'IMAGE') {
      const img = new Image();
      img.onload = () => {
        mediaReadyUrlsRef.current.add(url);
      };
      img.onerror = () => {
        mediaFailedUrlsRef.current.add(url);
      };
      img.src = url;
      return;
    }

    const existing = mediaPreloadVideoRef.current.get(url);
    if (existing) return;

    const v = document.createElement('video');
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.src = url;

    const markReady = () => {
      mediaReadyUrlsRef.current.add(url);
      mediaPreloadVideoRef.current.delete(url);
      v.removeEventListener('loadeddata', markReady);
      v.removeEventListener('canplay', markReady);
      v.removeEventListener('error', markFailed);
    };

    const markFailed = () => {
      mediaFailedUrlsRef.current.add(url);
      mediaPreloadVideoRef.current.delete(url);
      v.removeEventListener('loadeddata', markReady);
      v.removeEventListener('canplay', markReady);
      v.removeEventListener('error', markFailed);
    };

    v.addEventListener('loadeddata', markReady);
    v.addEventListener('canplay', markReady);
    v.addEventListener('error', markFailed);
    mediaPreloadVideoRef.current.set(url, v);

    try {
      v.load();
    } catch {
      markFailed();
    }
  }, []);

  const isMediaReady = useCallback((ad: Ad | null) => {
    if (!ad) return false;
    const url = ad.mediaUrl;
    if (!url) return false;
    return mediaReadyUrlsRef.current.has(url);
  }, []);

  const isMediaFailed = useCallback((ad: Ad | null) => {
    if (!ad) return false;
    const url = ad.mediaUrl;
    if (!url) return true;
    return mediaFailedUrlsRef.current.has(url);
  }, []);

  const advanceToNextPlayable = useCallback(() => {
    if (ads.length <= 1) return;

    finalizeCurrentImpression();

    setIsTransitioning(false);
    waitingForNextSincePerfRef.current = null;

    setCurrentIndex((prev) => {
      if (ads.length <= 1) return prev;

      for (let i = 1; i <= ads.length; i += 1) {
        const idx = (prev + i) % ads.length;
        const candidate = ads[idx];
        if (!candidate) continue;

        const url = candidate.mediaUrl;
        if (!url) continue;
        if (!mediaFailedUrlsRef.current.has(url)) return idx;
      }

      return prev;
    });
  }, [ads, finalizeCurrentImpression]);

  const startRotateTimer = useCallback(
    (delayMs: number = ROTATE_INTERVAL_MS) => {
      clearRotateTimer();

      if (ads.length <= 1) return;

      rotateTimerIdRef.current = window.setTimeout(() => {
        if (!nextAd) return;

        preloadNext(nextAd);

        const ready = isMediaReady(nextAd);
        const failed = isMediaFailed(nextAd);

        if (failed) {
          advanceToNextPlayable();
          return;
        }

        if (ready) {
          waitingForNextSincePerfRef.current = null;
          transitionEndHandledRef.current = false;
          setIsTransitioning((prev) => (prev ? prev : true));
          return;
        }

        const now = performance.now();
        if (waitingForNextSincePerfRef.current == null) {
          waitingForNextSincePerfRef.current = now;
        }

        const waited = now - (waitingForNextSincePerfRef.current ?? now);
        if (waited >= NEXT_MEDIA_MAX_WAIT_MS) {
          const url = nextAd.mediaUrl;
          if (url) {
            mediaFailedUrlsRef.current.add(url);
          }
          advanceToNextPlayable();
          return;
        }

        startRotateTimer(NEXT_MEDIA_RETRY_MS);
      }, delayMs);
    },
    [
      ads.length,
      advanceToNextPlayable,
      clearRotateTimer,
      isMediaFailed,
      isMediaReady,
      nextAd,
      preloadNext,
    ]
  );

  const transitionCss = isTransitioning
    ? `transform ${TRANSITION_DURATION_MS}ms ease-in-out`
    : 'none';

  const exitToOrder = useCallback(async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;

    clearRotateTimer();
    finalizeCurrentImpression();

    // 🚀 즉시 화면 전환 (비동기 작업 전에 먼저 실행)
    navigate('/order');

    // 백그라운드에서 정리 작업 수행
    // 🆕 SSE 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      sseConnectedRef.current = false;
    }

    // 🆕 얼굴 인식 결과를 store에 반영한 뒤, 서버 데이터를 초기화합니다.
    try {
      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`);
      if (response.ok) {
        const data = await response.json();
        console.log('📥 새로운 얼굴 인식 데이터 수신:', data);
        setAnalysis(data);
      }
    } catch (err) {
      console.error('분석 데이터 가져오기 실패:', err);
    }

    try {
      const response = await fetch(`${AI_CORE_BASE_URL}/api/analysis`, { method: 'DELETE' });
      if (response.ok) {
        console.log('🗑️ 서버 분석 데이터 초기화 완료');
      }
    } catch (err) {
      console.error('분석 데이터 초기화 실패:', err);
    }
  }, [clearRotateTimer, finalizeCurrentImpression, navigate, setAnalysis]);

  // 🆕 컴포넌트 마운트 시 서버 데이터만 초기화 (프론트 스토어는 유지)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log('🔄 광고 화면 진입: 서버 얼굴 인식 데이터 초기화');
      console.log('   ℹ️  프론트 스토어 데이터는 유지됨 (처음으로 버튼에서 설정한 경우)');

      // 서버의 분석 데이터만 삭제
      // 프론트 스토어(clearLocalAnalysis)는 호출하지 않음
      // → 처음으로 버튼에서 설정한 데이터를 보존
      fetch(`${AI_CORE_BASE_URL}/api/analysis`, { method: 'DELETE' }).catch((err) => {
        console.error('초기 데이터 초기화 실패:', err);
      });
    }
  }, []);

  // 🆕 SSE 연결 및 얼굴 인식 감지
  useEffect(() => {
    if (sseConnectedRef.current) return;

    console.log('🔌 SSE 연결 시도:', `${AI_CORE_BASE_URL}/api/stream/status`);

    const eventSource = new EventSource(`${AI_CORE_BASE_URL}/api/stream/status`);
    eventSourceRef.current = eventSource;
    sseConnectedRef.current = true;

    eventSource.onopen = () => {
      console.log('✅ SSE 연결 성공');
    };

    eventSource.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data);

        // has_data가 true이고 is_analyzing이 false이면 얼굴 인식 완료
        if (data.has_data === true && data.is_analyzing === false && !finalizedRef.current) {
          console.log('👤 얼굴 인식 완료! /order로 이동합니다.', data);
          void exitToOrder();
        }
      } catch (err) {
        console.error('SSE 데이터 파싱 실패:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE 연결 오류:', err);
      eventSource.close();
      sseConnectedRef.current = false;

      // 3초 후 재연결 시도
      window.setTimeout(() => {
        if (!finalizedRef.current) {
          console.log('🔄 SSE 재연결 시도...');
          sseConnectedRef.current = false;
        }
      }, 3000);
    };

    return () => {
      eventSource.close();
      sseConnectedRef.current = false;
    };
  }, [exitToOrder]);

  // On enter: guard against immediate accidental exit + flush any previous queue
  useEffect(() => {
    ignoreInputUntilRef.current = performance.now() + EXIT_GUARD_MS;
    adImpressionQueue.flush();

    return () => {
      clearRotateTimer();
    };
  }, [clearRotateTimer]);

  // Handle "no ads" rule: auto navigate to /order after 2 seconds
  useEffect(() => {
    if (ads.length !== 0) return;

    const t = window.setTimeout(() => {
      navigate('/order');
    }, 2000);

    return () => window.clearTimeout(t);
  }, [ads.length, navigate]);

  // Initialize timing when ads load / when current ad becomes available
  useEffect(() => {
    if (!currentAd) return;
    finalizedRef.current = false;

    setCurrentIndex(0);
    setIsTransitioning(false);

    startCurrentAdTiming(currentAd);
    preloadNext(nextAd);
    startRotateTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads.length]);

  // Whenever currentIndex changes, restart timing/timer
  useEffect(() => {
    if (!currentAd) return;
    startCurrentAdTiming(currentAd);
    preloadNext(nextAd);
    startRotateTimer();
  }, [currentAd, nextAd, preloadNext, startCurrentAdTiming, startRotateTimer]);

  // Exit on user input/presence (with entry guard)
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

  const handleMediaReady = useCallback((ad: Ad) => {
    const url = ad.mediaUrl;
    if (!url) return;
    mediaReadyUrlsRef.current.add(url);
  }, []);

  const handleMediaError = useCallback(
    (ad: Ad) => {
      const url = ad.mediaUrl;
      if (url) {
        mediaFailedUrlsRef.current.add(url);
      }

      if (currentAd?.adId === ad.adId) {
        clearRotateTimer();
        advanceToNextPlayable();
      }
    },
    [advanceToNextPlayable, clearRotateTimer, currentAd?.adId]
  );

  const onTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'transform') return;
      if (!isTransitioning) return;
      if (transitionEndHandledRef.current) return;
      transitionEndHandledRef.current = true;

      finalizeCurrentImpression();

      setCurrentIndex((prev) => {
        if (ads.length <= 1) return prev;
        return (prev + 1) % ads.length;
      });
      setIsTransitioning(false);
    },
    [ads.length, finalizeCurrentImpression, isTransitioning]
  );

  if (!currentAd) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
        <div className=" w-full h-full origin-center bg-black" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      <div className=" w-full h-full origin-center bg-black">
        <div className="w-full h-full overflow-hidden relative">
          {/* Current */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: isTransitioning ? 'translate3d(-100%, 0, 0)' : 'translate3d(0, 0, 0)',
              transition: transitionCss,
            }}
          >
            {renderAd(currentAd, {
              onReady: () => handleMediaReady(currentAd),
              onError: () => handleMediaError(currentAd),
            })}
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
              {renderAd(nextAd, {
                onReady: () => handleMediaReady(nextAd),
                onError: () => handleMediaError(nextAd),
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
