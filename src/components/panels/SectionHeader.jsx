import { COLORS, MONO, SANS } from "../../theme.js";

export default function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textBright, fontFamily: SANS, letterSpacing: 0.4 }}>{title}</div>
      {sub && <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
