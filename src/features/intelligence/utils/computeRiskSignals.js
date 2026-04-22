import { round, clamp01 } from "../../../lib/numbers.js";
import { computeTopCounterparties } from "./computeCounterparties.js";

/**
 * Non-custodial, non-AML "risk" language: concentration and repetition only — *not* sanctions, fraud, or law.
 * @param {object} snap
 * @param {string} self
 */
export function computeConcentrationSignals(snap, self) {
  if (!snap) {
    return {
      summary: "No data.",
      rows: [],
    };
  }
  const cp = computeTopCounterparties(snap, self, 6);
  const n = Math.max(1, snap.txHistory?.length || 0);
  const topShare = cp[0] ? cp[0].count / n : 0;
  const concentration = round(clamp01(0.2 + topShare * 1.2, 0.9), 2);
  const rows = [
    {
      label: "Address concentration (sample)",
      value: `${(topShare * 100).toFixed(0)}% in top counterparty in this sample`,
      level: topShare > 0.4 ? "elevated" : "typical",
      explainer: "A large share to one public counterparty in the sampled history may reflect recurring counterparties, routing, or automation — " + "heuristic only, not a label of intent.",
    },
  ];
  return {
    summary:
      "These items describe *pattern concentration* in public data you already fetched. " +
      "They are not sanctions screening, travel rule compliance, or fraud determinations.",
    rows,
    concentration,
    counterparties: cp,
  };
}
