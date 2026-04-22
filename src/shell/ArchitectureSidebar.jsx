import { COLORS, SANS, MONO } from "../theme.js";
import LayerBadge from "../components/panels/Badge.jsx";
import Panel from "../components/panels/Panel.jsx";

const Indicator = ({ color, pulse }) => (
  <span
    style={{
      display: "inline-block",
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: COLORS[color] || color,
      boxShadow: pulse ? `0 0 6px ${COLORS[color] || color}` : "none",
      animation: pulse ? "pulse 2s infinite" : "none",
    }}
  />
);

const ArchLayer = ({ label, sublabel, color, items, active }) => (
  <div
    style={{
      padding: "8px 12px",
      borderRadius: 6,
      border: `1px solid ${active ? COLORS[color] : COLORS.border}`,
      background: active ? (COLORS[color + "Dim"] || "rgba(255,255,255,0.03)") : "rgba(255,255,255,0.02)",
      transition: "all 0.4s ease",
      marginBottom: 6,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: SANS, color: COLORS[color], letterSpacing: 0.5 }}>{label}</span>
      <Indicator color={color} pulse={active} />
    </div>
    <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginBottom: 4 }}>{sublabel}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            fontSize: 9,
            padding: "1px 6px",
            borderRadius: 3,
            background: `${COLORS[color]}11`,
            color: COLORS[color],
            fontFamily: MONO,
            border: `1px solid ${COLORS[color]}22`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default function ArchitectureSidebar({ activeLayer }) {
  return (
    <Panel title="ARCHITECTURE" badge={<LayerBadge color="accent">4 LAYERS</LayerBadge>} style={{ gridRow: "1/3" }}>
      <ArchLayer
        label="L3 — AGENT RUNTIME"
        sublabel="Illustration / simulation in this build"
        color="green"
        items={["Evernode", "DIDs", "Persistence", "Tasks"]}
        active={activeLayer === 3}
      />
      <ArchLayer
        label="L2 — NETWORK STACK"
        sublabel="ILP (illustration)"
        color="purple"
        items={["ILP v4", "STREAM", "Connectors"]}
        active={activeLayer === 2}
      />
      <ArchLayer
        label="L1 — ACCOUNTING"
        sublabel="Double-entry (illustration)"
        color="amber"
        items={["TigerBeetle", "Batching", "ACID"]}
        active={activeLayer === 1}
      />
      <ArchLayer
        label="L0 — KERNEL + READ INTEL"
        sublabel="XRPL public mainnet (LIVE read)"
        color="accent"
        items={["Consensus", "DEX", "Escrow", "NFTs", "AMM", "Account_tx"]}
        active={activeLayer === 0}
      />
      <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: "1px solid " + COLORS.border }}>
        <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginBottom: 6 }}>DATA SOURCE</div>
        <div style={{ fontSize: 10, color: COLORS.text, fontFamily: SANS, lineHeight: 1.6 }}>
          <span style={{ color: COLORS.green }}>L0 + wallet</span> → <span style={{ color: COLORS.green }}>LIVE</span> (public read)<br />
          <span style={{ color: COLORS.textDim }}>L1</span> → <span style={{ color: COLORS.amber }}>Simulated</span>
          <br />
          <span style={{ color: COLORS.textDim }}>L2</span> → <span style={{ color: COLORS.amber }}>Simulated</span>
          <br />
          <span style={{ color: COLORS.textDim }}>L3</span> → <span style={{ color: COLORS.amber }}>Simulated</span>
        </div>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 9, color: COLORS.textDim, lineHeight: 1.4, fontFamily: SANS }}>
        Phase 2 adds read-only address intelligence. No private keys, no transaction submission from this app.
      </p>
    </Panel>
  );
}
