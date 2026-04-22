import { COLORS, MONO, SANS } from "../theme.js";
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
    }}
  />
);

const stateColor = (s) => (s === "SAMPLE" || s === "POLLING" ? "green" : s === "WAITING" ? "amber" : "textDim");

/**
 * Local-only demo. Not on-chain, not your wallet, not a transaction.
 */
export default function DemoAgentsPanel({ onSpawn, agentList }) {
  return (
    <Panel
      title="SHELL PROCESSES (DEMO)"
      badge={<LayerBadge color="green">ILLUSTRATION</LayerBadge>}
      headerRight={
        onSpawn && (
          <button
            type="button"
            onClick={onSpawn}
            style={{
              background: COLORS.greenDim,
              border: "1px solid " + COLORS.green + "44",
              color: COLORS.green,
              fontSize: 9,
              fontFamily: MONO,
              padding: "3px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            + SPAWN
          </button>
        )
      }
      footnote="Demo rows only. Not on-chain, not a custodial panel, and not a transaction or signing surface."
    >
      <p style={{ margin: "0 0 6px", fontSize: 9, color: COLORS.textDim, fontFamily: SANS, lineHeight: 1.4 }}>Local visual demo — not a production process manager.</p>
      <div style={{ fontSize: 10, fontFamily: MONO }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 70px 100px 40px 40px",
            padding: "4px 0",
            borderBottom: "1px solid " + COLORS.border,
            color: COLORS.textDim,
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          <span>PID</span>
          <span>NAME</span>
          <span>STATE</span>
          <span>DID</span>
          <span>MEM</span>
          <span>MARK</span>
        </div>
        {agentList.map((a) => (
          <div
            key={a.id}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 70px 100px 40px 40px",
              padding: "5px 0",
              borderBottom: "1px solid " + COLORS.border + "22",
            }}
          >
            <span style={{ color: COLORS.textDim }}>{a.id}</span>
            <span style={{ color: COLORS.textBright, fontWeight: 500 }}>{a.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Indicator color={stateColor(a.state)} pulse={a.state === "POLLING"} />
              <span style={{ color: COLORS[stateColor(a.state)], fontSize: 9 }}>{a.state}</span>
            </span>
            <span style={{ color: COLORS.textDim, fontSize: 9 }}>{(a.did || "").slice(0, 12)}…</span>
            <span style={{ color: COLORS.text }}>{a.memory}M</span>
            <span style={{ color: COLORS.accent }}>{a.txCount}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
