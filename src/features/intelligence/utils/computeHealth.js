import { round, safeNumber, clamp01 } from "../../../lib/numbers.js";
import { classifyActivityHeuristics } from "./classifyActivity.js";

/**
 * "Wallet health" as a *read-only* composite of diversity + activity, not a safety or compliance score.
 * @param {object} snap
 * @param {string} self
 */
export function computeReadonlyHealth(snap, self) {
  if (!snap || snap.notFound) {
    return { score: 0, level: "unknown", blurb: "Add a valid public address to compute observational signals." };
  }
  const a = classifyActivityHeuristics(snap, self);
  const n = snap.txHistory?.length || 0;
  const tlines = safeNumber(snap.trustLineCount, 0);
  const nfts = safeNumber(snap.nftCount, 0);
  const xrp = safeNumber(snap.xrp, 0);

  const activity = clamp01(0.15 * Math.log10(10 + n) + (n > 0 ? 0.15 : 0), 0.4);
  const diversity = clamp01(0.05 * tlines + 0.12 * nfts * 0.1 + 0.05 * (snap.openOffersCount > 0 ? 1 : 0), 0.35);
  const balancePresence = xrp > 0 ? 0.15 : 0.05;
  const raw = activity + diversity + balancePresence;
  // Penalize extreme "only one relationship" a bit
  const penalty = a.traderLikelihood > 0.6 && tlines < 1 ? 0.05 : 0;
  const score = round(clamp01(0.35 + (raw * 0.5) - penalty) * 100, 0);

  let level = "moderate";
  if (score < 30) level = "sparse";
  if (score > 65) level = "broad";
  if (n < 2) level = "early";

  return {
    score,
    level,
    blurb: "Composite observational index from public ledger fields only. Not a credit, safety, or compliance rating.",
  };
}
