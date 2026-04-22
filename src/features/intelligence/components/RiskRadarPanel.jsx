import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, SANS, MONO } from "../../../theme.js";

/**
 * "Risk" here = concentration of activity in a sample — *not* sanctions, KYC, or fraud.
 */
export default function RiskRadarPanel({ intel, address }) {
  if (!address) {
    return (
      <Panel
        title="PATTERN FOCUS (NOT AML)"
        badge={<LayerBadge color="red">SIGNAL, NOT A VERDICT</LayerBadge>}
        footnote="Plain-language take on *how concentrated* co-appearance is in a sample — not a law-enforcement or compliance conclusion."
      >
        <EmptyState message="Add a watch address. For informational, observational use only; not a compliance tool." />
      </Panel>
    );
  }
  const r = intel?.risk;
  if (!r?.rows?.length) {
    return (
      <Panel title="PATTERN FOCUS (NOT AML)" badge={<LayerBadge color="red">—</LayerBadge>}>
        <EmptyState message="No pattern summary for this state." />
      </Panel>
    );
  }
  return (
    <Panel
      title="PATTERN FOCUS (NOT AML / NOT KYC)"
      badge={<LayerBadge color="red">CONCENTRATION-ONLY</LayerBadge>}
      footnote={r.summary}
    >
      {r.rows.map((row) => (
        <div
          key={row.label}
          style={{
            marginBottom: 8,
            padding: 8,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            fontSize: 10,
            color: COLORS.text,
            fontFamily: SANS,
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 9, fontFamily: MONO, color: row.level === "elevated" ? COLORS.amber : COLORS.textDim, marginBottom: 4 }}>{row.level.toUpperCase()}</div>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{row.label}</div>
          <div style={{ color: COLORS.textDim, fontSize: 9, fontFamily: SANS }}>{row.value}</div>
          <div style={{ color: COLORS.textDim, fontSize: 8, fontFamily: SANS, marginTop: 4, fontStyle: "italic" }}>{row.explainer}</div>
        </div>
      ))}
    </Panel>
  );
}
