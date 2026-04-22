import { isValidClassicAddress } from "xrpl";

/**
 * XRPL classic address (r...). Does not support X-Address in v1; extend later.
 * @param {string} s
 * @returns {boolean}
 */
export function isValidWatchAddress(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim();
  if (t.length < 25 || t.length > 40) return false;
  return isValidClassicAddress(t);
}

/**
 * @param {string} addr
 * @param {number} [head=6]
 * @param {number} [tail=4]
 */
export function shortAddress(addr, head = 6, tail = 4) {
  if (!addr || addr.length < head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
