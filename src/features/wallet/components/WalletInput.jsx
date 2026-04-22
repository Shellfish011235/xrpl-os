import { COLORS, MONO } from "../../../theme.js";

export default function WalletInput({ value, onChange, onAdd, errorHint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd?.()}
          placeholder="Paste r... address to watch (read-only)"
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 180,
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${errorHint ? COLORS.red : COLORS.borderActive}`,
            borderRadius: 4,
            color: COLORS.textBright,
            fontFamily: MONO,
            fontSize: 12,
            padding: "6px 10px",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={onAdd}
          style={{
            background: COLORS.accentDim,
            border: `1px solid ${COLORS.accent}55`,
            color: COLORS.accent,
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          WATCH
        </button>
      </div>
      {errorHint && <div style={{ color: COLORS.amber, fontSize: 10, fontFamily: MONO }}>{errorHint}</div>}
    </div>
  );
}
