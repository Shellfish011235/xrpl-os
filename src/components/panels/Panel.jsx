import { COLORS, MONO, SANS } from "../../theme.js";

/**
 * @param {object} props
 * @param {React.ReactNode} [props.badge]
 * @param {React.ReactNode} [props.headerRight]
 * @param {import("react").CSSProperties} [props.style]
 * @param {import("react").CSSProperties} [props.bodyStyle]
 * @param {string} [props.footnote]
 */
export default function Panel({ title, badge, children, style, bodyStyle, headerRight, footnote }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.surfaceLight,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              fontFamily: SANS,
              color: COLORS.textBright,
              letterSpacing: 0.3,
            }}
          >
            {title}
          </span>
          {badge}
        </div>
        {headerRight}
      </div>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px 14px",
          ...bodyStyle,
        }}
      >
        {children}
      </div>
      {footnote && (
        <div
          style={{
            fontSize: 9,
            color: COLORS.textDim,
            fontFamily: MONO,
            padding: "4px 14px 8px",
            lineHeight: 1.4,
            borderTop: `1px solid ${COLORS.border}44`,
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {footnote}
        </div>
      )}
    </div>
  );
}
