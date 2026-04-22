import { COLORS, MONO } from "../theme.js";

/**
 * @param {object} props
 * @param {{ wsStatus: string, tps: number, settled: number, ledgerIndex: number }} props.stats
 * @param {number} props.demoAgents
 * @param {() => void} props.onOpenArch
 */
export default function HeaderBar({ stats, demoAgents, onOpenArch }) {
  const wsColor = stats.wsStatus === "LIVE" ? "green" : stats.wsStatus === "CONNECTING" ? "amber" : "red";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid " + COLORS.border,
        background: "linear-gradient(180deg, " + COLORS.surfaceLight + " 0%, " + COLORS.surface + " 100%)",
        position: "relative",
        overflow: "hidden",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "linear-gradient(135deg, " + COLORS.accent + ", " + COLORS.green + ")",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: COLORS.bg,
            fontFamily: MONO,
          }}
        >
          X
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textBright, letterSpacing: 1, fontFamily: MONO }}>
            XRPL-OS
            <span
              style={{
                marginLeft: 8,
                fontSize: 9,
                padding: "2px 6px",
                borderRadius: 3,
                background: COLORS[wsColor + "Dim"] || COLORS.greenDim,
                color: COLORS[wsColor],
                border: "1px solid " + COLORS[wsColor] + "33",
                fontWeight: 600,
              }}
            >
              {stats.wsStatus}
            </span>
            <span
              style={{
                marginLeft: 6,
                fontSize: 8,
                color: COLORS.textDim,
                fontFamily: MONO,
                fontWeight: 500,
                padding: "2px 5px",
                border: "1px solid " + COLORS.border,
                borderRadius: 3,
              }}
            >
              Read-only · no execution
            </span>
          </div>
          <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, letterSpacing: 0.5 }}>
            Mainnet — Ledger #{stats.ledgerIndex || "…"} — Public read stream + public RPC
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, minWidth: 0, alignItems: "center", justifyContent: "flex-end", gap: 12, zIndex: 1, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onOpenArch}
          style={{
            background: COLORS.accentDim,
            border: "1px solid " + COLORS.accent + "55",
            color: COLORS.accent,
            fontSize: 10,
            fontFamily: MONO,
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 4,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          SYSTEM ARCHITECTURE
        </button>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", zIndex: 1, flexWrap: "wrap" }}>
        {[
          { label: "TPS (est.)", value: "~" + stats.tps, color: "accent" },
          { label: "DEMO PROCS", value: demoAgents, color: "green" },
          { label: "STREAM TX", value: stats.settled, color: "amber" },
          { label: "LEDGER", value: stats.ledgerIndex ? "#" + stats.ledgerIndex : "…", color: "purple" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: COLORS[s.color] }}>{s.value}</div>
            <div style={{ fontSize: 8, color: COLORS.textDim, fontFamily: MONO, letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
