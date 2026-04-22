import { COLORS, MONO } from "../../../theme.js";
import { shortAddress } from "../utils/address.js";

export default function WalletSelector({ addresses, selected, onSelect, onRemove }) {
  if (!addresses.length) return <div style={{ color: COLORS.textDim, fontSize: 10, fontFamily: MONO, marginTop: 6 }}>No saved watches yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
      {addresses.map((a) => {
        const active = a === selected;
        return (
          <div
            key={a}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 8px",
              borderRadius: 4,
              background: active ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${active ? COLORS.accent + "44" : COLORS.border}`,
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(a)}
              style={{
                flex: 1,
                textAlign: "left",
                background: "none",
                border: "none",
                color: active ? COLORS.textBright : COLORS.text,
                fontFamily: MONO,
                fontSize: 10,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {a.length < 20 ? a : shortAddress(a, 8, 4)}
            </button>
            <button
              type="button"
              onClick={() => onRemove(a)}
              style={{
                color: COLORS.textDim,
                background: "none",
                border: "none",
                fontSize: 10,
                fontFamily: MONO,
                cursor: "pointer",
              }}
              title="Remove from this device only (local list)"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
