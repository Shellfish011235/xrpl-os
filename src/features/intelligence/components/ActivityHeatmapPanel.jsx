import Panel from "../../../components/panels/Panel.jsx";
import LayerBadge from "../../../components/panels/Badge.jsx";
import { COLORS, MONO, SANS } from "../../../theme.js";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ActivityHeatmapPanel({ intel, address }) {
  const heat = intel?.heat || [0, 0, 0, 0, 0, 0, 0].map(() => 0.05);
  if (!address) {
    return (
      <Panel title="ACTIVITY HEAT (V1 BUCKETS)" badge={<LayerBadge color="amber">SAMPLE</LayerBadge>}>
        <p style={{ margin: 0, color: COLORS.textDim, fontSize: 10, fontFamily: SANS, lineHeight: 1.45 }}>
          Simple 7-bucket view from the sampled list order (v1; not a calendar of real-world time yet).
        </p>
      </Panel>
    );
  }
  return (
    <Panel
      title="ACTIVITY HEAT (V1 BUCKETS)"
      badge={<LayerBadge color="amber">7 SLICES</LayerBadge>}
      footnote="Darkness = more transactions in that list slice, not a proof of time-of-day behavior."
    >
      <p style={{ margin: "0 0 6px", fontSize: 9, color: COLORS.textDim, fontFamily: MONO, lineHeight: 1.4 }}>Binned for exploration only.</p>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-end" }}>
        {DAYS.map((d, i) => (
          <div key={d + i} style={{ textAlign: "center", minWidth: 20 }}>
            <div
              style={{
                width: 22,
                height: 28 + 40 * heat[i],
                background: `linear-gradient(180deg, ${COLORS.accent} 0%, ${COLORS.accent}44 100%)`,
                borderRadius: 2,
                opacity: 0.2 + 0.8 * heat[i],
                marginBottom: 2,
                border: `1px solid ${COLORS.accent}33`,
              }}
            />
            <div style={{ fontSize: 8, color: COLORS.textDim, fontFamily: MONO }}>{d}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
