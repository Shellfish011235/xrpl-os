import { COLORS, SANS } from "../../theme.js";

export default function EmptyState({ message }) {
  return (
    <div
      style={{
        color: COLORS.textDim,
        textAlign: "center",
        padding: 16,
        fontSize: 11,
        fontFamily: SANS,
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}
