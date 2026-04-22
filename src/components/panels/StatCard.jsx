import { COLORS, MONO } from "../../theme.js";

export default function StatCard({ label, value, color = "accent" }) {
  return (
    <div style={{ textAlign: "left", minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: MONO, color: COLORS[color] || COLORS.accent }}>{value}</div>
      <div style={{ fontSize: 8, color: COLORS.textDim, fontFamily: MONO, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
