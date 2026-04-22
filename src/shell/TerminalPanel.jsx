import { useRef, useEffect, useState } from "react";
import { COLORS, MONO } from "../theme.js";
import { PUBLIC_MAINNET_WSS } from "../services/xrpl/client.js";

/**
 * In-shell REPL. Commands are local UI / read-only; no private keys or on-chain submit.
 * @param {{ connectWS: () => void, stats: object, agents: object[], onSpawn: () => void, onKill: (id: string) => void, onArch: () => void, gridColumn?: string, gridRow?: string }} p
 */
export default function TerminalPanel({ connectWS, stats, agents, onSpawn, onKill, onArch, gridColumn = "2/4", gridRow = 2 }) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState(() => [
    { type: "system", text: "XRPL-OS Phase 2 — Read-only analytics + public data watch" },
    { type: "system", text: "Kernel: XRPL Mainnet | Stream: " + PUBLIC_MAINNET_WSS },
    { type: "system", text: "No private keys, no automatic signing, no on-chain transaction submission from this app." },
  ]);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  const run = (raw) => {
    const parts = raw.trim().toLowerCase().split(/\s+/);
    const c = parts[0];
    let out = [];
    switch (c) {
      case "help":
        out = [
          { type: "output", text: "Commands: help | stats | ledger | arch | ps | spawn | kill <id> | reconnect | clear" },
        ];
        break;
      case "ps":
        out = [{ type: "output", text: "DEMO   NAME                STATE      DID" }];
        agents.forEach((a) => {
          out.push({ type: "output", text: a.id + "  " + a.name.padEnd(16) + "  " + a.state.padEnd(8) + "  " + a.did });
        });
        break;
      case "spawn":
        onSpawn?.();
        out = [{ type: "success", text: "Demo process spawned (local only)" }];
        break;
      case "kill": {
        const t = parts[1];
        if (t) {
          onKill?.(t);
          out = [{ type: "error", text: "If matched, row removed (demo list only)" }];
        } else {
          out = [{ type: "error", text: "kill <id or name>" }];
        }
        break;
      }
      case "stats":
        out = [
          { type: "output", text: "WebSocket:    " + stats.wsStatus },
          { type: "output", text: "Ledger:       #" + stats.ledgerIndex },
          { type: "output", text: "TPS:          ~" + stats.tps },
          { type: "output", text: "Stream TX+ :   " + stats.settled + " (since load)" },
        ];
        break;
      case "ledger":
        out = [
          { type: "output", text: "Endpoint:  " + PUBLIC_MAINNET_WSS },
          { type: "output", text: "Ledger:    #" + stats.ledgerIndex + " (stream)" },
          { type: "output", text: "This UI is read-only — no user tx submission" },
        ];
        break;
      case "arch":
      case "architecture":
        onArch?.();
        out = [{ type: "system", text: "System architecture (modal) opened" }];
        break;
      case "reconnect":
        connectWS();
        out = [{ type: "system", text: "Reconnecting stream…" }];
        break;
      case "clear":
        setLines([]);
        return;
      case "":
        return;
      default:
        out = [{ type: "error", text: "not found: " + c + "  (type help)" }];
    }
    setLines((p) => [...p, { type: "input", text: "$ " + raw }, ...out]);
  };

  return (
    <div
      style={{
        gridColumn,
        gridRow,
        display: "flex",
        flexDirection: "column",
        background: COLORS.surface,
        minHeight: 0,
        borderTop: "1px solid " + COLORS.border,
        borderLeft: "1px solid " + COLORS.border,
        borderRight: "1px solid " + COLORS.border,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderBottom: "1px solid " + COLORS.border, background: COLORS.surfaceLight }}>
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.red }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.amber }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green }} />
        </div>
        <span style={{ fontSize: 10, fontFamily: MONO, color: COLORS.textDim }}>xrpl-os — local help only · no key material</span>
      </div>
      <div ref={ref} style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "8px 14px", fontFamily: MONO, fontSize: 11 }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.type === "input" ? COLORS.accent : line.type === "success" ? COLORS.green : line.type === "error" ? COLORS.red : line.type === "system" ? COLORS.textDim : COLORS.text,
              fontWeight: line.type === "input" ? 600 : 400,
              marginBottom: 1,
              whiteSpace: "pre-wrap",
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "6px 14px", borderTop: "1px solid " + COLORS.border, flexShrink: 0 }}>
        <span style={{ color: COLORS.accent, fontFamily: MONO, fontSize: 12, marginRight: 8 }}>$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              run(input);
              setInput("");
            }
          }}
          placeholder="Type help… (no private keys, no on-chain send)"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: COLORS.textBright, fontFamily: MONO, fontSize: 12 }}
        />
      </div>
    </div>
  );
}
