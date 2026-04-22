import { round } from "../../../lib/numbers.js";

/**
 * Heuristic token / IOU exposure from trust lines and XRP (observational).
 * @param {object} snap
 */
export function computeTokenExposure(snap) {
  if (!snap) {
    return {
      xrp: 0,
      lines: [],
      summary: "No data loaded.",
    };
  }
  const xrp = snap.xrp || 0;
  const lines = (snap.tokenLines || []).map((l) => {
    const v = Math.abs(parseFloat(l.balance) || 0);
    return {
      currency: l.currency,
      counterparty: l.account,
      balance: v,
    };
  });
  lines.sort((a, b) => b.balance - a.balance);
  return {
    xrp: round(xrp, 4),
    lines: lines.slice(0, 12),
    trustLineCount: snap.trustLineCount || 0,
    summary: `Heuristic view of ${lines.length} trust line(s) and XRP balance; not a valuation or recommendation.`,
  };
}
