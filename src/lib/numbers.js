/**
 * @param {string|number|null|undefined} n
 * @param {number} [fallback=0]
 */
export function safeNumber(n, fallback = 0) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return v;
}

/**
 * @param {number} n
 * @param {number} digits
 */
export function round(n, digits = 2) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/**
 * @param {number} value
 * @param {number} [max=1]
 */
export function clamp01(value, max = 1) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
}
