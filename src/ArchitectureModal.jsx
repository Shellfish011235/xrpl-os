import { useEffect } from "react";
import { COLORS, SANS, MONO } from "./theme.js";

const flow = [
  { k: "Public XRPL data", d: "Ledger, transactions, validated streams (read-only)", c: "accent" },
  { k: "Analytics engine", d: "Telemetry, classification, views derived from public data", c: "amber" },
  { k: "Intelligence / AI layer", d: "Insights, suggestions, simulation — not execution", c: "purple" },
  { k: "Optional: wallet connect (future)", d: "User-owned wallet — read or propose only until you sign", c: "textDim" },
  { k: "User wallet signs", d: "Value movement only after explicit off-device / user-controlled signature", c: "green" },
];

export default function ArchitectureModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="xrpl-os-arch-title"
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(6,8,12,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          background: COLORS.surface,
          border: `1px solid ${COLORS.borderActive}`,
          borderRadius: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceLight,
          }}
        >
          <h2
            id="xrpl-os-arch-title"
            style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: MONO, color: COLORS.textBright, letterSpacing: 0.5 }}
          >
            System architecture
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: COLORS.redDim, border: `1px solid ${COLORS.red}55`,
              color: COLORS.red, fontSize: 11, fontFamily: MONO, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
        <div style={{ padding: 16, fontFamily: SANS, color: COLORS.text, fontSize: 12, lineHeight: 1.55 }}>
          <p style={{ margin: "0 0 12px", color: COLORS.textDim }}>
            Data flows top to bottom. The trust boundary: anything that moves value sits after the user&apos;s
            own wallet and explicit signature — not hidden backend execution.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {flow.map((step, i) => (
              <div key={step.k}>
                <div
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", borderRadius: 6,
                    background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`,
                    marginBottom: 8,
                  }}
                >
                  <span style={{
                    minWidth: 24, height: 24, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: (COLORS[step.c] || COLORS.textDim) + "22",
                    color: COLORS[step.c] || COLORS.textDim, fontFamily: MONO, fontSize: 10, fontWeight: 700,
                  }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.textBright, marginBottom: 4, fontSize: 12 }}>{step.k}</div>
                    <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: MONO }}>{step.d}</div>
                  </div>
                </div>
                {i < flow.length - 1 && (
                  <div style={{ textAlign: "center", color: COLORS.textDim, fontSize: 10, margin: "-2px 0 6px", fontFamily: MONO }}>↓</div>
                )}
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 11, color: COLORS.amber, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <strong>Compliance posture (product)</strong> — This app today is read-only on mainnet (observation). L2/L3 features in
            the shell are illustrated / simulated. Review <code style={{ color: COLORS.accent, fontSize: 10 }}>docs/STRATEGY.md</code> for
            roadmap and risk framing; hire counsel before offering custody, execution-as-a-service, or yield to end users.
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 10, color: COLORS.textDim }}>
            Extended diagram + repo copy:{" "}
            <a href="https://github.com/Shellfish011235/xrpl-os/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.accent }}>
              docs/ARCHITECTURE.md
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
