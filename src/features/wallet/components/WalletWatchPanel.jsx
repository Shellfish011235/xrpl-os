import { useState } from "react";
import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import { COLORS, MONO, SANS } from "../../../theme.js";
import WalletInput from "./WalletInput.jsx";
import WalletSelector from "./WalletSelector.jsx";

export default function WalletWatchPanel({ watchlist, onAdd, onRemove, onSelect, selected, inputHint }) {
  const [v, setV] = useState("");

  const add = () => {
    const r = onAdd(v);
    if (r?.ok) setV("");
  };

  return (
    <Panel
      title="WALLET WATCH (READ-ONLY)"
      badge={<LayerBadge color="accent">USER-CONTROLLED VISIBILITY</LayerBadge>}
      footnote="Type or paste a public r-address. No private keys, seeds, or signing — visibility only. Data from public mainnet."
    >
      <p style={{ margin: 0, color: COLORS.textDim, fontSize: 10, fontFamily: SANS, lineHeight: 1.45 }}>
        <strong style={{ color: COLORS.text }}>User-controlled watchlist.</strong> Wallets stay on the ledger; you only type an address
        to observe balances and public history. Not custody.
      </p>
      <WalletInput value={v} onChange={setV} onAdd={add} errorHint={inputHint} />
      <div style={{ marginTop: 10, fontSize: 9, color: COLORS.green, fontFamily: MONO }}>Observational only — no execution, no connection for signing</div>
      <WalletSelector addresses={watchlist} selected={selected} onSelect={onSelect} onRemove={onRemove} />
    </Panel>
  );
}
