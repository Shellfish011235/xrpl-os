import { shortAddress } from "../features/wallet/utils/address.js";
import { round } from "./numbers.js";

export { shortAddress as shortenLedgerAddress };

/**
 * @param {number|string} drops
 */
export function dropsToXrpDisplay(drops) {
  const n = typeof drops === "string" ? parseInt(drops, 10) : drops;
  if (!Number.isFinite(n)) return "0 XRP";
  return `${round(n / 1_000_000, 4)} XRP`;
}

/**
 * @param {number} seconds
 */
export function formatAgoMs(ms) {
  if (!ms || !Number.isFinite(ms)) return "—";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * @param {number} ts — ripple epoch seconds? account_tx 'date' is not always unix. Keep raw display.
 * XRPL "date" field in some APIs is in seconds since ripple epoch. For simplicity show ISO if we can't convert.
 * @param {string|number|null|undefined} rippleDate
 */
export function formatRippleDate(rippleDate) {
  if (rippleDate == null) return "—";
  if (typeof rippleDate === "number" && Number.isFinite(rippleDate)) {
    const RIPPLE_EPOCH = 946684800; // 2000-01-01 UTC in unix
    const unix = rippleDate + RIPPLE_EPOCH;
    try {
      return new Date(unix * 1000).toLocaleString();
    } catch {
      return String(rippleDate);
    }
  }
  return String(rippleDate);
}

export function notFinancialAdviceSuffix() {
  return " (informational only, not financial advice)";
}
