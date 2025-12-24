/**
 * Create a LocalDateTime string without timezone (local time).
 * Format: YYYY-MM-DDTHH:mm:ss
 * Example: 2025-12-24T09:45:31
 */
export function toLocalDateTimeString(date: Date = new Date()): string {
  const pad2 = (n: number) => String(n).padStart(2, '0');

  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}
