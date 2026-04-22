import { round } from "../../../lib/numbers.js";

/**
 * Non-authoritative behavior labels for UI. All outputs are heuristics.
 * @param {object} snap
 * @param {string} self
 */
export function classifyActivityHeuristics(snap, self) {
  if (!snap || snap.notFound) {
    return {
      exchangeLikeScore: 0,
      traderLikelihood: 0,
      holderLikelihood: 0,
      dormancyHint: 0,
      botLikeRepetition: 0,
      treasuryLike: 0,
      whaleHint: 0,
      notes: ["No public history yet for this address, or account not found."],
    };
  }
  const txs = snap.txHistory || [];
  const typeCount = {};
  for (const t of txs) {
    const T = t.type || "Unknown";
    typeCount[T] = (typeCount[T] || 0) + 1;
  }
  const offers = (typeCount.OfferCreate || 0) + (typeCount.OfferCancel || 0);
  const payments = typeCount.Payment || 0;
  const n = Math.max(1, txs.length);

  const offerShare = offers / n;
  const payShare = payments / n;
  const traderLikelihood = round(0.2 * (offerShare * 2 + (snap.openOffersCount > 0 ? 0.3 : 0) + (snap.trustLineCount > 2 ? 0.2 : 0)), 2);
  const holderLikelihood = round(0.15 + payShare * 0.2 + (snap.nftCount > 0 ? 0.1 : 0) - offerShare * 0.1, 2);
  const exchangeLikeScore = round(0.2 * (payments / n) + 0.15 * (typeCount.TrustSet ? 0.2 : 0) + 0.1 * offerShare, 2);

  const xrp = snap.xrp || 0;
  const whaleHint = xrp > 500_000 ? 0.85 : xrp > 50_000 ? 0.4 : 0.12;

  const amm = snap.objectProfile?.ammishCount || 0;
  const offersCount = snap.openOffersCount || 0;
  const treasuryLike = xrp > 1_000_000 && (snap.nftCount || 0) < 5 && offers < 2 ? 0.55 : 0.1;

  /** Very rough repetition proxy: same other party ratio */
  const others = new Map();
  for (const t of txs) {
    const o = t.to === self ? t.from : t.to;
    if (o && o !== self) others.set(o, (others.get(o) || 0) + 1);
  }
  const maxC = others.size ? Math.max(...others.values()) : 0;
  const botLikeRepetition = txs.length > 30 && maxC / n > 0.4 ? 0.35 : 0.08;
  if (n < 5) {
    // Insufficient for strong statements
  }

  const last = txs[0];
  const daysSince = (() => {
    if (!last || typeof last.time !== "number") return 999;
    const d = 946684800 + last.time;
    return (Date.now() / 1000 - d) / 86400;
  })();
  const dormancyHint = !last || last.time == null ? 0.1 : daysSince > 30 ? 0.55 : 0.15;

  const notes = [
    `Heuristic pass over the last ${n} public transaction(s) in this view (capped; more may exist).`,
    offers > 3 ? "Multiple DEX-related transaction types in sample — DEX-activity signal (not a judgment)." : "DEX-related activity appears limited in the sampled window.",
    xrp > 1_000_000 ? "Large self-custody XRP balance in this snapshot — " + "treat as numeric context only, not a category." : "Balance in normal retail-like range in most networks (rough heuristic).",
  ];

  return {
    exchangeLikeScore: Math.min(1, exchangeLikeScore + 0.1),
    traderLikelihood: Math.min(1, Math.max(0, traderLikelihood)),
    holderLikelihood: Math.min(1, Math.max(0, holderLikelihood)),
    dormancyHint: Math.min(1, Math.max(0, dormancyHint)),
    botLikeRepetition: Math.min(1, botLikeRepetition),
    treasuryLike: Math.min(1, Math.max(0, treasuryLike)),
    whaleHint: Math.min(1, Math.max(0, whaleHint)),
    ammishObserved: amm,
    offerDepthSignal: offersCount,
    typeCount,
    notes,
  };
}
