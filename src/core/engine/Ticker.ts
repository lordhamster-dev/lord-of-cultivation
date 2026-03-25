/** Offline progress calculation. */

export interface OfflineResult {
  elapsedMs: number;
  cappedMs: number;
  wasCapped: boolean;
}

/**
 * Calculate how much offline time has elapsed since `lastTickTime`,
 * capped at `maxOfflineHours`.
 */
export function calculateOfflineProgress(
  lastTickTime: number,
  maxOfflineHours = 12,
): OfflineResult {
  const now = Date.now();
  const elapsed = Math.max(0, now - lastTickTime);
  const maxMs = maxOfflineHours * 60 * 60 * 1000;
  const cappedMs = Math.min(elapsed, maxMs);
  return {
    elapsedMs: elapsed,
    cappedMs,
    wasCapped: elapsed > maxMs,
  };
}

/** Format milliseconds into a human-readable string. */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours}小时`;
  return `${hours}小时${remainingMins}分钟`;
}
