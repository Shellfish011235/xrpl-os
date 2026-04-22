import { COLORS, MONO } from "../../theme.js";

export default function LayerBadge({ color, children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontFamily: MONO,
        fontWeight: 600,
        letterSpacing: 0.5,
        background:
          color === "accent"
            ? COLORS.accentDim
            : color === "green"
              ? COLORS.greenDim
              : color === "amber"
                ? COLORS.amberDim
                : color === "purple"
                  ? COLORS.purpleDim
                  : color === "red"
                    ? COLORS.redDim
                    : "rgba(255,255,255,0.06)",
        color: COLORS[color] || color,
        border: `1px solid ${(COLORS[color] || color) + "33"}`,
      }}
    >
      {children}
    </span>
  );
}
