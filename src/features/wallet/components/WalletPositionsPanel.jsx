import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import EmptyState from "../../../components/panels/EmptyState.jsx";
import { COLORS, MONO } from "../../../theme.js";
export default function WalletPositionsPanel({ snap }) {
  if (!snap || snap.notFound) {
    return (
      <Panel title="POSITIONS & OBJECTS" badge={<LayerBadge color="purple">PUBLIC</LayerBadge>}>
        <EmptyState message="No positions loaded." />
      </Panel>
    );
  }
  const p = snap.objectProfile || {};
  return (
    <Panel
      title="POSITIONS & OBJECTS (HEUR.)"
      badge={<LayerBadge color="purple">ESCROW/AMM-ISH</LayerBadge>}
      footnote="Derived from public account_objects view. AMM-ISH counts AMM/AMMDeposit-style entry types. Heuristic, not a full protocol audit."
    >
      <div style={{ display: "grid", gap: 6, fontSize: 10, fontFamily: MONO, color: COLORS.textDim }}>
        <div>
          <span style={{ color: COLORS.textBright }}>Open DEX offers (sampled):</span> {snap.openOffersCount}
        </div>
        <div>
          <span style={{ color: COLORS.textBright }}>Escrow like (Escrow):</span> {p.escrowCount || 0}
        </div>
        <div>
          <span style={{ color: COLORS.textBright }}>AMM-ISH entries:</span> {p.ammishCount || 0}
        </div>
        <div>
          <span style={{ color: COLORS.textBright }}>NFTs (nfts call):</span> {snap.nftCount} — {snap.nftCount > 0 ? "sample below" : "—"}
        </div>
        {!!snap.nfts?.length && (
          <div style={{ marginTop: 4, fontSize: 9, lineHeight: 1.5 }}>
            {snap.nfts.slice(0, 3).map((n, i) => (
              <div key={i}>
                {n.NFTokenID
                  ? `${(n.NFTokenID).slice(0, 8)}…`
                  : n.uri
                    ? "with-uri"
                    : "nft"}
              </div>
            ))}
          </div>
        )}
        {!!snap.offers?.length && (
          <div style={{ marginTop: 6, fontSize: 9, color: COLORS.textDim, maxHeight: 80, overflow: "auto" }}>
            {snap.offers.slice(0, 4).map((o) => {
              const seq = o.seq || o.Seq;
              return (
                <div key={seq} style={{ marginBottom: 4 }}>
                  Offer <span style={{ color: COLORS.amber }}>#{String(seq).slice(0, 6)}</span> …
                </div>
              );
            })}
          </div>
        )}
        <div style={{ fontSize: 9, color: COLORS.textDim, marginTop: 4 }}>Reserves: base reserve and owner reserve depend on network rules; see XRPL documentation for your own planning.</div>
      </div>
    </Panel>
  );
}
