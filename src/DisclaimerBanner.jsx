import { COLORS, SANS, MONO } from "./theme.js";

/**
 * High-level product disclaimer — not legal advice. Formal Terms / Privacy
 * are linked from the repo; replace with counsel-approved copy at public launch.
 */
export default function DisclaimerBanner() {
  return (
    <div
      role="note"
      style={{
        width: "100%",
        padding: "8px 20px",
        background: "rgba(255,184,0,0.08)",
        borderBottom: `1px solid ${COLORS.amber}33`,
        fontFamily: SANS,
        fontSize: 11,
        lineHeight: 1.45,
        color: COLORS.text,
      }}
    >
      <span style={{ color: COLORS.amber, fontFamily: MONO, fontSize: 10, fontWeight: 600, marginRight: 8 }}>
        NOTICE
      </span>
      <span>
        XRPL-OS is observational software tooling. It does not custody keys, sign transactions, or move funds.
        Users control all wallets and signatures. Nothing here is financial, legal, or tax advice. See
        {" "}
        <a
          href="https://github.com/Shellfish011235/xrpl-os/blob/main/docs/STRATEGY.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.accent }}
        >
          project doctrine
        </a>
        {" "}
        and your own professional counsel.
      </span>
    </div>
  );
}
