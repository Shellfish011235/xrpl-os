import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, SANS, MONO } from "../../../theme.js";

export default function WalletHealthPanel({ intel, address }) {
  if (!address) {
    return (
      <Panel
        title="LAYER HEALTH (OBSERVATION INDEX)"
        badge={<LayerBadge color="green">NOT A CREDIT SCORE</LayerBadge>}
        footnote="Composite of diversity + activity in our snapshot, not a safety, compliance, or default-risk rating."
      >
        <EmptyState message="Select a watch address to compute an observation index number." />
      </Panel>
    );
  }
  const h = intel?.health;
  if (!h) {
    return (
      <Panel title="LAYER HEALTH (OBSERVATION INDEX)" badge={<LayerBadge color="green">N/A</LayerBadge>}>
        <EmptyState message="No index yet." />
      </Panel>
    );
  }
  return (
    <Panel
      title="LAYER HEALTH (OBSERVATION INDEX)"
      badge={<LayerBadge color="green">HEURISTIC DASHBOARD FRIENDLY</LayerBadge>}
      footnote={h.blurb + " "}
    >
      <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            fontFamily: "DM Sans, sans-serif",
            color: COLORS.accent,
            lineHeight: 1,
          }}
        >
          {h.score}
        </div>
        <div style={{ fontSize: 11, color: COLORS.text, fontFamily: SANS, marginBottom: 4 }}>/ 100 (internal blend)</div>
      </div>
      <div style={{ fontSize: 10, color: COLORS.amber, fontFamily: SANS, marginTop: 6, textTransform: "capitalize" }}>
        Read-only bucket: {h.level}
      </div>
    </Panel>
  );
}
