import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import SectionHeader from "../../../components/panels/SectionHeader.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, SANS, MONO } from "../../../theme.js";

export default function IntelligenceOverviewPanel({ intel, address }) {
  if (!address || intel?.kind === "idle") {
    return (
      <Panel title="INTELLIGENCE (HEURISTICS)" badge={<LayerBadge color="amber">SIGNALS</LayerBadge>}>
        <EmptyState message="Heuristic, non-authoritative summaries. Select a watch address to populate." />
      </Panel>
    );
  }
  const a = intel?.activity;
  if (!a) {
    return (
      <Panel title="INTELLIGENCE (HEURISTICS)" badge={<LayerBadge color="amber">SIGNALS</LayerBadge>}>
        <EmptyState message="No derived signals for this state." />
      </Panel>
    );
  }
  return (
    <Panel
      title="INTELLIGENCE (HEURISTICS)"
      badge={<LayerBadge color="amber">PROBABLE / NOT PROVEN</LayerBadge>}
      footnote="Heuristic signals for personal research. Not a grade of legality, compliance, or intent. For informational use only; not financial advice."
    >
      <SectionHeader
        title="Read-only analytics (observational only)"
        sub="Patterns inferred from a bounded public sample — not complete chain history for all time."
      />
      <p style={{ margin: "0 0 8px", fontSize: 10, color: COLORS.text, fontFamily: SANS, lineHeight: 1.45 }}>
        DEX-activity and holder labels are <strong>likelihoods for UI</strong> only. The ledger does not report user intent. No custody. No
        execution.
      </p>
      <ul style={{ margin: 0, paddingLeft: 16, color: COLORS.textDim, fontSize: 10, fontFamily: SANS, lineHeight: 1.55 }}>
        <li>DEX-style activity signal: ~{(a.traderLikelihood * 100).toFixed(0)}% style score</li>
        <li>Long-hold / rail usage hint: ~{(a.holderLikelihood * 100).toFixed(0)}% style score</li>
        <li>Recurring rail / many payments hint: ~{(a.exchangeLikeScore * 100).toFixed(0)}% style score</li>
        <li>Large-balance (public field) style hint: ~{(a.whaleHint * 100).toFixed(0)}% label strength</li>
        <li>Dormancy (sample recency) hint: ~{(a.dormancyHint * 100).toFixed(0)}% style score</li>
        <li>Repetition shape (very rough): ~{(a.botLikeRepetition * 100).toFixed(0)}% (heuristic, not a bot label)</li>
        <li>Treasury shape (heuristic, not a role): ~{(a.treasuryLike * 100).toFixed(0)}% style match</li>
        <li>AMM-ISH public objects: {a.ammishObserved} (visible entry types, not a position recommendation)</li>
      </ul>
      <div style={{ marginTop: 8, fontSize: 9, color: COLORS.textDim, fontFamily: MONO }}>{(a.notes && a.notes[0]) || ""}</div>
    </Panel>
  );
}
