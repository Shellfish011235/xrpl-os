import { useMemo } from "react";
import { classifyActivityHeuristics } from "../utils/classifyActivity.js";
import { computeConcentrationSignals } from "../utils/computeRiskSignals.js";
import { computeReadonlyHealth } from "../utils/computeHealth.js";
import { computeTokenExposure } from "../utils/computeExposure.js";
import { computeTopCounterparties } from "../utils/computeCounterparties.js";

/**
 * Derives all Phase-2 heuristics from a read-only snapshot. No network I/O.
 * @param {import("../../../services/xrpl/normalize.js")} snap
 * @param {string | null} self — watched address
 */
export function useWalletIntelligence(snap, self) {
  return useMemo(() => {
    if (!self) {
      return {
        kind: "idle",
        activity: null,
        health: null,
        exposure: null,
        risk: null,
        counterparties: [],
        heat: [],
      };
    }
    const a = snap ? classifyActivityHeuristics(snap, self) : null;
    const health = computeReadonlyHealth(snap, self);
    const exposure = computeTokenExposure(snap);
    const risk = computeConcentrationSignals(snap, self);
    const counterparties = snap ? computeTopCounterparties(snap, self, 10) : [];
    const heat = buildActivityHeat(snap, self);
    return {
      kind: "ready",
      activity: a,
      health,
      exposure,
      risk,
      counterparties,
      heat,
    };
  }, [snap, self]);
}

/**
 * @param {object} snap
 * @param {string} self
 */
function buildActivityHeat(snap) {
  if (!snap?.txHistory?.length) {
    return Array.from({ length: 7 }, () => 0.05);
  }
  const h = [0, 0, 0, 0, 0, 0, 0];
  const slice = snap.txHistory.slice(0, 200);
  slice.forEach((t, i) => {
    const b = i % 7;
    h[b] = (h[b] || 0) + 1;
  });
  const max = Math.max(1, ...h);
  return h.map((x) => 0.12 + (x / max) * 0.78);
}
