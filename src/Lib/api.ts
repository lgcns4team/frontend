import axios from 'axios';

/**
 * Axios instance used by the Advertisement feature.
 *
 * - If `VITE_API_BASE_URL` is set, we treat it as the server origin/base (e.g. https://example.com)
 * - Otherwise, we fall back to same-origin (empty baseURL) so `/api/...` works.
 */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const api = axios.create({
  baseURL: rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : '',
  timeout: 10_000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Keep noisy logs minimal; callers can handle errors.
    return Promise.reject(err);
  }
);

/**
 * Join base URL and path safely.
 * Example: joinUrl('https://a.com/', '/ads/x.jpg') -> 'https://a.com/ads/x.jpg'
 */
export function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Resolve ad media URL.
 * - Absolute URLs are returned as-is.
 * - If mediaUrl starts with `/` and `VITE_API_BASE_URL` exists, return `${BASE_URL}${mediaUrl}`.
 */
export function resolveMediaUrl(mediaUrl: string): string {
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  if (!rawBaseUrl) return mediaUrl;
  if (!mediaUrl.startsWith('/')) return mediaUrl;
  return joinUrl(rawBaseUrl, mediaUrl);
}
