import Panel from "../../../components/panels/Panel.jsx";
import StatCard from "../../../components/panels/StatCard.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import LoadingBlock from "../../../components/panels/LoadingBlock.jsx";
import { formatRippleDate } from "../../../lib/formatters.js";
import { COLORS, MONO } from "../../../theme.js";
import { formatAgoFromRippleTime } from "../../../lib/time.js";

export default function WalletSummaryPanel({ snap, loading, error, onRefresh, address }) {
  let body;
  if (!address) body = <EmptyState message="Add a classic address in Wallet Watch to load read-only account fields." />;
  else if (loading) body = <LoadingBlock />;
  else if (error) body = <EmptyState message={`Mainnet read error: ${error}`} />;
  else if (!snap) body = <LoadingBlock />;
  else if (snap.notFound) body = <EmptyState message={snap.errorMessage || "Account not on ledger in this request."} />;
  else
    body = (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 12,
          alignItems: "start",
        }}
      >
        <StatCard label="XRP (balance field)" value={`${snap.xrp} XRP`} color="green" />
        <StatCard label="Owner count" value={String(snap.ownerCount)} color="amber" />
        <StatCard label="Sequence" value={String(snap.sequence)} color="accent" />
        <StatCard label="Txs in sample" value={String(snap.txCountEstimate)} color="purple" />
        <StatCard label="Trust lines" value={String(snap.trustLineCount)} color="textDim" />
        <div style={{ gridColumn: "1 / -1", fontSize: 9, color: COLORS.textDim, fontFamily: MONO, lineHeight: 1.5 }}>
          <div>Last validated ledger in responses: {snap.lastValidLedger ?? "—"}</div>
          <div>Previous txn id: {snap.previousTxnId ? snap.previousTxnId.slice(0, 18) + "…" : "—"}</div>
          {snap.txHistory[0] && <div>Last tx time (if present): {formatAgoFromRippleTime(snap.txHistory[0].time)} — {formatRippleDate(snap.txHistory[0].time)}</div>}
        </div>
      </div>
    );

  return (
    <Panel
      title="WALLET SNAPSHOT (PUBLIC FIELDS)"
      badge={<LayerBadge color="green">ACCOUNT FIELDS</LayerBadge>}
      headerRight={
        onRefresh && address ? (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              background: COLORS.greenDim,
              border: `1px solid ${COLORS.green}55`,
              color: COLORS.green,
              fontSize: 9,
              fontFamily: MONO,
              padding: "3px 8px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            REFRESH
          </button>
        ) : null
      }
      footnote="Data from public rippled. Sample size limits apply. Not a complete archive of all time."
    >
      {body}
    </Panel>
  );
}
