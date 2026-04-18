import { useState, useEffect, useRef, useCallback } from "react";

const MONO = "'Fira Code', 'SF Mono', 'Cascadia Code', monospace";
const SANS = "'DM Sans', 'Helvetica Neue', sans-serif";

const COLORS = {
  bg: "#0a0e17",
  surface: "#111827",
  surfaceLight: "#1a2332",
  border: "#1e2d3d",
  borderActive: "#2a4a6b",
  text: "#c9d1d9",
  textDim: "#5a6a7a",
  textBright: "#e6edf3",
  accent: "#00d4ff",
  accentDim: "rgba(0,212,255,0.15)",
  green: "#00ff88",
  greenDim: "rgba(0,255,136,0.12)",
  amber: "#ffb800",
  amberDim: "rgba(255,184,0,0.12)",
  red: "#ff4757",
  redDim: "rgba(255,71,87,0.12)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.12)",
};

const genId = () => Math.random().toString(36).slice(2, 8);
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const AGENT_NAMES = [
  "PayrollAgent", "LiquidityBot", "InvoiceSettler", "FXArbitrage",
  "TreasuryMgr", "ComplianceAI", "CrossBorderPay", "YieldOptimizer",
  "NFTMinter", "EscrowAgent", "AMMRebalancer", "StablecoinPeg",
];
const AGENT_STATES = ["RUNNING", "WAITING", "SETTLING", "IDLE"];
const TX_TYPES = ["Payment", "OfferCreate", "TrustSet", "EscrowCreate", "NFTokenMint", "CheckCreate"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "XRP", "BTC"];
const DESTINATIONS = ["rN7n3473SaZBCG4dFL83w7p1W9cgPBKpfq", "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh", "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"];

const LayerBadge = ({ color, children }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 10,
    fontFamily: MONO,
    fontWeight: 600,
    letterSpacing: 0.5,
    background: color === "accent" ? COLORS.accentDim : color === "green" ? COLORS.greenDim : color === "amber" ? COLORS.amberDim : color === "purple" ? COLORS.purpleDim : COLORS.redDim,
    color: COLORS[color] || color,
    border: `1px solid ${COLORS[color] || color}33`,
  }}>{children}</span>
);

const Indicator = ({ color, pulse }) => (
  <span style={{
    display: "inline-block",
    width: 6, height: 6,
    borderRadius: "50%",
    background: COLORS[color] || color,
    boxShadow: pulse ? `0 0 6px ${COLORS[color] || color}` : "none",
    animation: pulse ? "pulse 2s infinite" : "none",
  }} />
);

const Panel = ({ title, badge, children, style, headerRight }) => (
  <div style={{
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    ...style,
  }}>
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 14px",
      borderBottom: `1px solid ${COLORS.border}`,
      background: COLORS.surfaceLight,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: SANS, color: COLORS.textBright, letterSpacing: 0.3 }}>{title}</span>
        {badge}
      </div>
      {headerRight}
    </div>
    <div style={{ flex: 1, overflow: "auto", padding: "10px 14px" }}>
      {children}
    </div>
  </div>
);

const ArchLayer = ({ label, sublabel, color, items, active }) => (
  <div style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: `1px solid ${active ? COLORS[color] : COLORS.border}`,
    background: active ? (COLORS[color + "Dim"] || "rgba(255,255,255,0.03)") : "rgba(255,255,255,0.02)",
    transition: "all 0.4s ease",
    marginBottom: 6,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: SANS, color: COLORS[color], letterSpacing: 0.5 }}>{label}</span>
      <Indicator color={color} pulse={active} />
    </div>
    <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginBottom: 4 }}>{sublabel}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((item, i) => (
        <span key={i} style={{
          fontSize: 9,
          padding: "1px 6px",
          borderRadius: 3,
          background: `${COLORS[color]}11`,
          color: COLORS[color],
          fontFamily: MONO,
          border: `1px solid ${COLORS[color]}22`,
        }}>{item}</span>
      ))}
    </div>
  </div>
);

export default function XRPL_OS() {
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ tps: 0, agents: 0, settled: 0, ilpRoutes: 0 });
  const [activeLayer, setActiveLayer] = useState(0);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([
    { type: "system", text: "XRPL-OS v0.1.0 — Decentralized Agent Operating System" },
    { type: "system", text: "Kernel: XRPL Mainnet | Network: ILP v4 | Accounting: TigerBeetle" },
    { type: "system", text: 'Type "help" for available commands' },
  ]);
  const logRef = useRef(null);
  const termRef = useRef(null);
  const tickRef = useRef(0);

  const addLog = useCallback((msg, level = "info") => {
    setLogs(prev => [...prev.slice(-60), { id: genId(), msg, level, ts: Date.now() }]);
  }, []);

  const addTx = useCallback(() => {
    const tx = {
      id: genId(),
      type: randomFrom(TX_TYPES),
      amount: (Math.random() * 10000).toFixed(2),
      currency: randomFrom(CURRENCIES),
      dest: randomFrom(DESTINATIONS).slice(0, 12) + "...",
      status: "pending",
      ts: Date.now(),
    };
    setTransactions(prev => [...prev.slice(-30), tx]);
    setTimeout(() => {
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: "settled" } : t));
      addLog(`TX ${tx.id} settled: ${tx.amount} ${tx.currency}`, "success");
    }, randomBetween(400, 2000));
    return tx;
  }, [addLog]);

  useEffect(() => {
    const initialAgents = AGENT_NAMES.slice(0, 6).map(name => ({
      id: genId(),
      name,
      state: randomFrom(AGENT_STATES),
      did: `did:xrpl:${genId()}`,
      memory: randomBetween(12, 256),
      txCount: randomBetween(0, 500),
      uptime: randomBetween(100, 86400),
    }));
    setAgents(initialAgents);
    setStats({ tps: 0, agents: initialAgents.length, settled: 0, ilpRoutes: randomBetween(3, 12) });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      setActiveLayer(prev => (prev + 1) % 4);

      if (Math.random() > 0.3) addTx();

      setAgents(prev => prev.map(a => ({
        ...a,
        state: Math.random() > 0.7 ? randomFrom(AGENT_STATES) : a.state,
        txCount: a.state === "SETTLING" ? a.txCount + 1 : a.txCount,
        memory: Math.min(256, a.memory + (Math.random() > 0.8 ? randomBetween(1, 8) : 0)),
      })));

      setStats(prev => ({
        tps: randomBetween(800, 1500),
        agents: prev.agents,
        settled: prev.settled + (Math.random() > 0.3 ? 1 : 0),
        ilpRoutes: randomBetween(3, 12),
      }));

      if (tickRef.current % 3 === 0) {
        const msgs = [
          "ILP packet routed via connector rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
          `TigerBeetle: batch committed — ${randomBetween(10, 100)} transfers`,
          `Agent ${randomFrom(AGENT_NAMES)} acquired DID credential`,
          `XRPL consensus round ${randomBetween(80000000, 90000000)} validated`,
          `Evernode: compute slot allocated — ${randomBetween(1, 8)} vCPU`,
          `Memory sync: ${randomBetween(1, 50)} agent states persisted`,
          `Cross-ledger path found: XRP → USD via ${randomBetween(2, 4)} hops`,
        ];
        addLog(randomFrom(msgs));
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [addTx, addLog]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [terminalHistory]);

  const handleCommand = (cmd) => {
    const parts = cmd.trim().toLowerCase().split(/\s+/);
    const c = parts[0];
    let output = [];

    switch (c) {
      case "help":
        output = [
          { type: "output", text: "Available commands:" },
          { type: "output", text: "  ps          — list running agents" },
          { type: "output", text: "  spawn <n>   — spawn a new agent" },
          { type: "output", text: "  kill <id>   — terminate an agent" },
          { type: "output", text: "  tx          — submit a transaction" },
          { type: "output", text: "  stats       — system statistics" },
          { type: "output", text: "  layers      — show OS architecture" },
          { type: "output", text: "  clear       — clear terminal" },
        ];
        break;
      case "ps":
        output = [{ type: "output", text: `PID    NAME                STATE      DID` }];
        agents.forEach(a => {
          output.push({ type: "output", text: `${a.id}  ${a.name.padEnd(18)} ${a.state.padEnd(10)} ${a.did}` });
        });
        break;
      case "spawn": {
        const name = parts[1] || randomFrom(AGENT_NAMES.filter(n => !agents.find(a => a.name === n))) || `Agent_${genId()}`;
        const newAgent = {
          id: genId(), name, state: "RUNNING",
          did: `did:xrpl:${genId()}`, memory: 16, txCount: 0, uptime: 0,
        };
        setAgents(prev => [...prev, newAgent]);
        setStats(prev => ({ ...prev, agents: prev.agents + 1 }));
        output = [{ type: "success", text: `Agent ${name} spawned [PID: ${newAgent.id}] [DID: ${newAgent.did}]` }];
        addLog(`Agent ${name} spawned`, "success");
        break;
      }
      case "kill": {
        const target = parts[1];
        const found = agents.find(a => a.id === target || a.name.toLowerCase() === target);
        if (found) {
          setAgents(prev => prev.filter(a => a.id !== found.id));
          setStats(prev => ({ ...prev, agents: prev.agents - 1 }));
          output = [{ type: "error", text: `Agent ${found.name} terminated [PID: ${found.id}]` }];
          addLog(`Agent ${found.name} killed`, "error");
        } else {
          output = [{ type: "error", text: `Agent not found: ${target}` }];
        }
        break;
      }
      case "tx": {
        const tx = addTx();
        output = [{ type: "success", text: `TX submitted: ${tx.id} | ${tx.type} | ${tx.amount} ${tx.currency} → ${tx.dest}` }];
        break;
      }
      case "stats":
        output = [
          { type: "output", text: `TPS:          ${stats.tps}` },
          { type: "output", text: `Agents:       ${agents.length}` },
          { type: "output", text: `Settled TXs:  ${stats.settled}` },
          { type: "output", text: `ILP Routes:   ${stats.ilpRoutes}` },
        ];
        break;
      case "layers":
        output = [
          { type: "output", text: "┌─────────────────────────────────────┐" },
          { type: "output", text: "│  L3  Agent Runtime (Processes)      │" },
          { type: "output", text: "│  L2  ILP (Network Stack)            │" },
          { type: "output", text: "│  L1  TigerBeetle (Accounting)       │" },
          { type: "output", text: "│  L0  XRPL (Kernel of Value)         │" },
          { type: "output", text: "└─────────────────────────────────────┘" },
        ];
        break;
      case "clear":
        setTerminalHistory([]);
        return;
      default:
        output = [{ type: "error", text: `xrpl-os: command not found: ${c}` }];
    }
    setTerminalHistory(prev => [
      ...prev,
      { type: "input", text: `$ ${cmd}` },
      ...output,
    ]);
  };

  const stateColor = (s) => s === "RUNNING" ? "green" : s === "SETTLING" ? "accent" : s === "WAITING" ? "amber" : "textDim";

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: COLORS.bg,
      fontFamily: SANS,
      color: COLORS.text,
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${COLORS.border};border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:${COLORS.borderActive}}
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: `1px solid ${COLORS.border}`,
        background: `linear-gradient(180deg, ${COLORS.surfaceLight} 0%, ${COLORS.surface} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)`,
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: COLORS.bg, fontFamily: MONO,
          }}>X</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textBright, letterSpacing: 1, fontFamily: MONO }}>
              XRPL-OS
            </div>
            <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, letterSpacing: 0.5 }}>
              Decentralized Agent Operating System
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center", zIndex: 1 }}>
          {[
            { label: "TPS", value: stats.tps, color: "accent" },
            { label: "AGENTS", value: agents.length, color: "green" },
            { label: "SETTLED", value: stats.settled, color: "amber" },
            { label: "ILP ROUTES", value: stats.ilpRoutes, color: "purple" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: COLORS[s.color] }}>{s.value}</div>
              <div style={{ fontSize: 8, color: COLORS.textDim, fontFamily: MONO, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "220px 1fr 280px",
        gridTemplateRows: "1fr 200px",
        gap: 1,
        background: COLORS.border,
        minHeight: 0,
      }}>
        {/* Left: Architecture */}
        <Panel title="ARCHITECTURE" badge={<LayerBadge color="accent">4 LAYERS</LayerBadge>} style={{ gridRow: "1/3" }}>
          <ArchLayer label="L3 — AGENT RUNTIME" sublabel="Processes / DIDs / Memory" color="green"
            items={["Evernode", "DIDs", "Persistence", "Tasks"]} active={activeLayer === 3} />
          <ArchLayer label="L2 — NETWORK STACK" sublabel="Interledger Protocol" color="purple"
            items={["ILP v4", "STREAM", "Connectors"]} active={activeLayer === 2} />
          <ArchLayer label="L1 — ACCOUNTING" sublabel="Double-Entry Ledger" color="amber"
            items={["TigerBeetle", "Batching", "ACID"]} active={activeLayer === 1} />
          <ArchLayer label="L0 — KERNEL" sublabel="XRPL Consensus" color="accent"
            items={["Consensus", "DEX", "Escrow", "NFTs", "AMM"]} active={activeLayer === 0} />
          <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginBottom: 6 }}>MENTAL MODEL</div>
            <div style={{ fontSize: 10, color: COLORS.text, fontFamily: SANS, lineHeight: 1.6 }}>
              <span style={{ color: COLORS.amber }}>Bitcoin</span> → Store of Value OS<br />
              <span style={{ color: COLORS.purple }}>Ethereum</span> → Smart Contract OS<br />
              <span style={{ color: COLORS.accent }}>XRPL</span> → <span style={{ color: COLORS.green }}>Financial Coordination OS</span>
            </div>
          </div>
        </Panel>

        {/* Center: Agent Process Table */}
        <Panel title="PROCESS TABLE" badge={<LayerBadge color="green">ps -aux</LayerBadge>}
          headerRight={
            <button type="button" onClick={() => handleCommand("spawn")} style={{
              background: COLORS.greenDim, border: `1px solid ${COLORS.green}44`,
              color: COLORS.green, fontSize: 10, fontFamily: MONO, padding: "3px 10px",
              borderRadius: 4, cursor: "pointer",
            }}>+ SPAWN</button>
          }>
          <div style={{ fontSize: 10, fontFamily: MONO }}>
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 70px 120px 50px 50px",
              padding: "4px 0", borderBottom: `1px solid ${COLORS.border}`,
              color: COLORS.textDim, fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
            }}>
              <span>PID</span><span>NAME</span><span>STATE</span><span>DID</span><span>MEM</span><span>TXs</span>
            </div>
            {agents.map(a => (
              <div key={a.id} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 70px 120px 50px 50px",
                padding: "5px 0", borderBottom: `1px solid ${COLORS.border}22`,
                animation: "slideIn 0.3s ease",
              }}>
                <span style={{ color: COLORS.textDim }}>{a.id}</span>
                <span style={{ color: COLORS.textBright, fontWeight: 500 }}>{a.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Indicator color={stateColor(a.state)} pulse={a.state === "RUNNING"} />
                  <span style={{ color: COLORS[stateColor(a.state)], fontSize: 9 }}>{a.state}</span>
                </span>
                <span style={{ color: COLORS.textDim, fontSize: 9 }}>{a.did.slice(0, 18)}...</span>
                <span style={{ color: COLORS.text }}>{a.memory}M</span>
                <span style={{ color: COLORS.accent }}>{a.txCount}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Right: Transaction Feed */}
        <Panel title="TX SETTLEMENT" badge={<LayerBadge color="amber">LIVE</LayerBadge>}>
          <div ref={logRef} style={{ fontSize: 10, fontFamily: MONO }}>
            {transactions.slice(-20).map(tx => (
              <div key={tx.id} style={{
                padding: "5px 8px", marginBottom: 3, borderRadius: 4,
                background: tx.status === "settled" ? COLORS.greenDim : "rgba(255,255,255,0.02)",
                border: `1px solid ${tx.status === "settled" ? COLORS.green + "22" : COLORS.border}`,
                animation: "slideIn 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ color: COLORS.textBright, fontWeight: 500 }}>{tx.type}</span>
                  <span style={{
                    fontSize: 8, padding: "1px 5px", borderRadius: 3,
                    background: tx.status === "settled" ? COLORS.greenDim : COLORS.amberDim,
                    color: tx.status === "settled" ? COLORS.green : COLORS.amber,
                  }}>{tx.status}</span>
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 9 }}>
                  {tx.amount} {tx.currency} → {tx.dest}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Bottom: Terminal */}
        <div style={{ gridColumn: "2/4", display: "flex", flexDirection: "column", background: COLORS.surface }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceLight,
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.red }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.amber }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: MONO, color: COLORS.textDim }}>xrpl-os terminal</span>
          </div>
          <div ref={termRef} style={{ flex: 1, overflow: "auto", padding: "8px 14px", fontFamily: MONO, fontSize: 11 }}>
            {terminalHistory.map((line, i) => (
              <div key={i} style={{
                color: line.type === "input" ? COLORS.accent : line.type === "success" ? COLORS.green : line.type === "error" ? COLORS.red : line.type === "system" ? COLORS.textDim : COLORS.text,
                fontWeight: line.type === "input" ? 600 : 400,
                marginBottom: 1, whiteSpace: "pre",
              }}>
                {line.text}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "6px 14px", borderTop: `1px solid ${COLORS.border}` }}>
            <span style={{ color: COLORS.accent, fontFamily: MONO, fontSize: 12, marginRight: 8 }}>$</span>
            <input
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && terminalInput.trim()) {
                  handleCommand(terminalInput.trim());
                  setTerminalInput("");
                }
              }}
              placeholder="type a command..."
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: COLORS.textBright, fontFamily: MONO, fontSize: 12,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
