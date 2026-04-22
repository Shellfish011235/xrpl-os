const KEY_LIST = "xrpl_os_watched_wallets_v1";
const KEY_SELECTED = "xrpl_os_selected_wallet_v1";

const safeParse = (s, fallback) => {
  try {
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

/**
 * @returns {string[]}
 */
export function loadWatchedWallets() {
  const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY_LIST);
  const p = safeParse(raw, []);
  if (!Array.isArray(p)) return [];
  return p
    .filter((x) => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {string[]} list
 */
export function saveWatchedWallets(list) {
  if (typeof localStorage === "undefined") return;
  const uniq = [...new Set((list || []).map((a) => String(a).trim()).filter(Boolean))].slice(0, 20);
  localStorage.setItem(KEY_LIST, JSON.stringify(uniq));
}

/**
 * @returns {string | null}
 */
export function loadSelectedWallet() {
  if (typeof localStorage === "undefined") return null;
  const s = localStorage.getItem(KEY_SELECTED);
  if (!s) return null;
  return s.trim() || null;
}

/**
 * @param {string | null} address
 */
export function saveSelectedWallet(address) {
  if (typeof localStorage === "undefined") return;
  if (!address) {
    localStorage.removeItem(KEY_SELECTED);
    return;
  }
  localStorage.setItem(KEY_SELECTED, String(address).trim());
}
