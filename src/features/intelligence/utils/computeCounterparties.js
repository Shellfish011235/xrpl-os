import { shortAddress } from "../../wallet/utils/address.js";

/**
 * Heuristic counterparty frequency from read-only history (not enforcement or compliance).
 * @param {import("../../../services/xrpl/normalize.js")} snap — snapshot with txHistory
 * @param {string} self
 * @param {number} [cap=8]
 */
export function computeTopCounterparties(snap, self, cap = 8) {
  if (!snap?.txHistory?.length) return [];
  const counts = new Map();
  const add = (addr) => {
    if (!addr || addr === self) return;
    counts.set(addr, (counts.get(addr) || 0) + 1);
  };
  for (const t of snap.txHistory) {
    if (t.from) add(t.from);
    if (t.to) add(t.to);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap)
    .map(([address, count]) => ({
      address,
      label: shortAddress(address, 6, 4),
      count,
    }));
}
