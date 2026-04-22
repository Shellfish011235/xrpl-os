import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, MONO } from "../../../theme.js";

export default function CounterpartyPanel({ intel, address }) {
  if (!address) {
    return (
      <Panel
        title="COUNTERPARTY FREQUENCY (SAMPLE)"
        badge={<LayerBadge color="textDim">PUBLIC IDS</LayerBadge>}
        footnote="Addresses that appear in your sampled public history, sorted by co-appearance count. Not a screening list."
      >
        <EmptyState message="Not enough to display until history loads." />
      </Panel>
    );
  }
  const list = intel?.counterparties;
  if (!list?.length) {
    return (
      <Panel title="COUNTERPARTY FREQUENCY (SAMPLE)" badge={<LayerBadge color="textDim">—</LayerBadge>}>
        <EmptyState message="No counterparties in this small account_tx sample, or not applicable." />
      </Panel>
    );
  }
  return (
    <Panel
      title="COUNTERPARTY FREQUENCY (SAMPLE)"
      badge={<LayerBadge color="accent">TOP (HEUR.)</LayerBadge>}
      footnote="Public addresses in this bounded tx window — not a travel-rule or sanctions workflow."
    >
      <div style={{ fontSize: 10, fontFamily: MONO }}>
        {list.map((c) => (
          <div
            key={c.address}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: `1px solid ${COLORS.border}22`,
            }}
          >
            <span style={{ color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis" }} title={c.address}>
              {c.label}
            </span>
            <span style={{ color: COLORS.accent }}>×{c.count}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
