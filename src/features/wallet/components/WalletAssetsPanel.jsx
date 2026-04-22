import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, MONO } from "../../../theme.js";
import { shortAddress } from "../utils/address.js";

export default function WalletAssetsPanel({ snap }) {
  if (!snap || snap.notFound) {
    return (
      <Panel
        title="ASSETS (TRUST LINES)"
        badge={<LayerBadge color="amber">LINE SNAPSHOT</LayerBadge>}
        footnote="IOU trust lines: balances and limits are public. Not a recommendation or valuation."
      >
        <EmptyState message="No IOU / trust line data yet." />
      </Panel>
    );
  }
  if (!snap.tokenLines?.length) {
    return (
      <Panel
        title="ASSETS (TRUST LINES)"
        badge={<LayerBadge color="amber">0 LINES</LayerBadge>}
        footnote="IOU trust lines: public fields only. No claim of safety or value."
      >
        <div style={{ color: COLORS.textDim, fontSize: 10, fontFamily: MONO, padding: 4 }}>No open trust lines in this response.</div>
      </Panel>
    );
  }
  return (
    <Panel
      title="ASSETS (TRUST LINES)"
      badge={<LayerBadge color="amber">READ-ONLY</LayerBadge>}
      footnote="Observational balances from account_lines. Informational; not a recommendation to hold or transact."
    >
      <div style={{ maxHeight: 200, overflow: "auto", fontSize: 10, fontFamily: MONO }}>
        {snap.tokenLines.slice(0, 20).map((l, i) => (
          <div
            key={`${l.currency}-${l.account}-${i}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: `1px solid ${COLORS.border}22`,
            }}
          >
            <span style={{ color: COLORS.text }}>{l.currency}</span>
            <span style={{ color: COLORS.textDim, margin: "0 4px" }}>@{shortAddress(l.account, 4, 3)}</span>
            <span style={{ color: COLORS.green }}>{l.balance}</span>
          </div>
        ))}
        {snap.tokenLines.length > 20 && <div style={{ color: COLORS.textDim, marginTop: 6, fontSize: 9 }}>+ more lines not shown</div>}
      </div>
    </Panel>
  );
}
