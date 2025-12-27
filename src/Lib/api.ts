import axios from 'axios';

/**
 * Advertisement 기능에서 사용하는 Axios 인스턴스.
 *
 * - `VITE_API_BASE_URL`이 설정되어 있으면 서버 origin/base(예: https://example.com)로 취급합니다.
 * - 그렇지 않으면 same-origin(빈 baseURL)으로 동작하여 `/api/...`가 동작하도록 합니다.
 */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const api = axios.create({
  baseURL: rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : '',
  timeout: 10_000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 불필요한 로그는 최소화하고, 에러 처리는 호출자가 담당합니다.
    return Promise.reject(err);
  }
);

/**
 * base URL과 path를 안전하게 결합합니다.
 * 예: joinUrl('https://a.com/', '/ads/x.jpg') -> 'https://a.com/ads/x.jpg'
 */
export function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * 광고 미디어 URL을 해석합니다.
 * - 절대 URL은 그대로 반환합니다.
 * - mediaUrl이 `/`로 시작하고 `VITE_API_BASE_URL`이 있으면 `${BASE_URL}${mediaUrl}`를 반환합니다.
 */
export function resolveMediaUrl(mediaUrl: string): string {
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;

  // Vite `public/` 아래 에셋은 same-origin(프론트에서 서빙)으로 유지되어야 합니다.
  // 여기에 VITE_API_BASE_URL을 붙이면 요청이 백엔드로 가서 404가 날 수 있습니다.
  if (mediaUrl.startsWith('/ads/') || mediaUrl.startsWith('/raw/')) return mediaUrl;

  if (!rawBaseUrl) return mediaUrl;
  if (!mediaUrl.startsWith('/')) return mediaUrl;
  return joinUrl(rawBaseUrl, mediaUrl);
}
