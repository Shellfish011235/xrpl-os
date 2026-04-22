import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, SANS, MONO } from "../../../theme.js";

export default function TokenExposurePanel({ intel, address }) {
  if (!address) {
    return (
      <Panel
        title="EXPOSURE (PUBLIC LINES + XRP)"
        badge={<LayerBadge color="purple">NOT A PORTFOLIO RATING</LayerBadge>}
        footnote="Shows IOU + XRP fields from the snapshot; not a valuation or rebalancing tool."
      >
        <EmptyState message="Add a watch address to view exposure-style rows." />
      </Panel>
    );
  }
  const e = intel?.exposure;
  return (
    <Panel
      title="EXPOSURE (PUBLIC LINES + XRP)"
      badge={<LayerBadge color="purple">BREAKDOWN</LayerBadge>}
      footnote={e?.summary || "Informational. Not a recommendation, allocation advice, or suitability call."}
    >
      <div style={{ fontSize: 10, color: COLORS.green, fontFamily: MONO, marginBottom: 6 }}>XRP field: {e?.xrp != null ? e.xrp : "—"} XRP</div>
      {!e?.lines?.length ? (
        <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: MONO }}>No IOU trust lines in this public response.</div>
      ) : (
        <div style={{ maxHeight: 90, overflow: "auto" }}>
          {e.lines.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                fontFamily: MONO,
                color: COLORS.textDim,
                marginBottom: 4,
              }}
            >
              <span style={{ color: COLORS.text }}>{l.currency}</span>
              <span>
                {l.balance} @ {l.counterparty ? l.counterparty.slice(0, 6) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
