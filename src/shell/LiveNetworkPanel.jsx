import { useEffect, useRef } from "react";
import { COLORS, MONO } from "../theme.js";
import LayerBadge from "../components/panels/Badge.jsx";
import Panel from "../components/panels/Panel.jsx";

export default function LiveNetworkPanel({ transactions, stats, formatTime }) {
  const txRef = useRef(null);
  const wsColor = stats.wsStatus === "LIVE" ? "green" : stats.wsStatus === "CONNECTING" ? "amber" : "red";
  useEffect(() => {
    if (txRef.current) txRef.current.scrollTop = txRef.current.scrollHeight;
  }, [transactions]);
  return (
    <Panel
      title="LIVE LEDGER TX STREAM (PUBLIC)"
      badge={<LayerBadge color={wsColor}>{stats.wsStatus === "LIVE" ? "MAINNET" : stats.wsStatus}</LayerBadge>}
      footnote="Unfiltered network traffic sample from your browser's subscription. Observational, not a complete view of the entire ledger."
    >
      <div ref={txRef} style={{ fontSize: 10, fontFamily: MONO, maxHeight: 280 }}>
        {transactions.length === 0 && (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 20, fontSize: 11 }}>{stats.wsStatus === "LIVE" ? "Waiting for public transactions…" : "Connecting…"}</div>
        )}
        {transactions.slice(-25).map((tx, i) => (
          <div
            key={tx.id + "-" + i}
            style={{
              padding: "5px 8px",
              marginBottom: 3,
              borderRadius: 4,
              background: tx.status === "settled" ? COLORS.greenDim : COLORS.redDim,
              border: "1px solid " + (tx.status === "settled" ? COLORS.green + "22" : COLORS.red + "22"),
              animation: "slideIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ color: COLORS.textBright, fontWeight: 500 }}>{tx.type}</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 8, color: COLORS.textDim }}>{formatTime(tx.ts)}</span>
                <span
                  style={{
                    fontSize: 8,
                    padding: "1px 5px",
                    borderRadius: 3,
                    background: tx.status === "settled" ? COLORS.greenDim : COLORS.redDim,
                    color: tx.status === "settled" ? COLORS.green : COLORS.red,
                  }}
                >
                  {tx.status}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.textDim, fontSize: 9 }}>
              <span>{tx.amount !== "—" ? tx.amount + " " + tx.currency : tx.account}</span>
              <span>→ {tx.dest}</span>
            </div>
            {tx.hash && <div style={{ fontSize: 8, color: COLORS.textDim, marginTop: 2, opacity: 0.6 }}>{tx.hash.slice(0, 24)}…</div>}
          </div>
        ))}
      </div>
    </Panel>
  );
}
