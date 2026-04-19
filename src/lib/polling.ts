export const INTERVAL_FAST_MS = 1000;
export const INTERVAL_SLOW_MS = 5000;
export const BACKOFF_MAX_MS = 30000;

export function nextBackoffMs(current: number): number {
  return Math.min(current * 2, BACKOFF_MAX_MS);
}

export function shouldUseFastInterval(view: {
  clockRunning: boolean;
  inIntermission: boolean;
  isFinal: boolean;
  isPreview: boolean;
}): boolean {
  if (view.isFinal || view.isPreview) return false;
  if (view.inIntermission) return false;
  if (view.clockRunning) return true;
  return false;
}
