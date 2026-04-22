import { COLORS, MONO } from "../../theme.js";

export default function LoadingBlock() {
  return <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: MONO, padding: 12, textAlign: "center" }}>Loading public ledger data…</div>;
}
