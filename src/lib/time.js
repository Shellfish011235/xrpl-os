const RIPPLE_EPOCH_OFFSET_SEC = 946684800; // 2000-01-01 UTC in unix seconds

/**
 * @param {number|undefined} rippleTime — seconds since Ripple epoch (1 Jan 2000)
 * @returns {Date | null}
 */
export function rippleTimeToDate(rippleTime) {
  if (rippleTime == null || !Number.isFinite(rippleTime)) return null;
  return new Date((RIPPLE_EPOCH_OFFSET_SEC + rippleTime) * 1000);
}

/**
 * @param {number|undefined} rippleTime
 * @returns {string}
 */
export function formatAgoFromRippleTime(rippleTime) {
  const d = rippleTimeToDate(rippleTime);
  if (!d) return "—";
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 5) return "just now";
  if (s < 60) return `${Math.floor(s)}s ago`;
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 48) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
