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

const dropsToXRP = (drops) => {
  if (!drops) return "0";
  const xrp = parseInt(drops) / 1_000_000;
  if (xrp >= 1_000_000) return (xrp / 1_000_000).toFixed(2) + "M";
  if (xrp >= 1_000) return (xrp / 1_000).toFixed(1) + "K";
  return xrp.toFixed(2);
};

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const LayerBadge = ({ color, children }) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10,
    fontFamily: MONO, fontWeight: 600, letterSpacing: 0.5,
    background: color === "accent" ? COLORS.accentDim : color === "green" ? COLORS.greenDim : color === "amber" ? COLORS.amberDim : color === "purple" ? COLORS.purpleDim : COLORS.redDim,
    color: COLORS[color] || color, border: `1px solid ${COLORS[color] || color}33`,
  }}>{children}</span>
);

const Indicator = ({ color, pulse }) => (
  <span style={{
    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    background: COLORS[color] || color,
    boxShadow: pulse ? `0 0 6px ${COLORS[color] || color}` : "none",
    animation: pulse ? "pulse 2s infinite" : "none",
  }} />
);

const Panel = ({ title, badge, children, style, headerRight }) => (
  <div style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
    overflow: "hidden", display: "flex", flexDirection: "column", ...style,
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: SANS, color: COLORS.textBright, letterSpacing: 0.3 }}>{title}</span>
        {badge}
      </div>
      {headerRight}
    </div>
    <div style={{ flex: 1, overflow: "auto", padding: "10px 14px" }}>{children}</div>
  </div>
);

const ArchLayer = ({ label, sublabel, color, items, active }) => (
  <div style={{
    padding: "8px 12px", borderRadius: 6,
    border: `1px solid ${active ? COLORS[color] : COLORS.border}`,
    background: active ? (COLORS[color + "Dim"] || "rgba(255,255,255,0.03)") : "rgba(255,255,255,0.02)",
    transition: "all 0.4s ease", marginBottom: 6,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: SANS, color: COLORS[color], letterSpacing: 0.5 }}>{label}</span>
      <Indicator color={color} pulse={active} />
    </div>
    <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginBottom: 4 }}>{sublabel}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((item, i) => (
        <span key={i} style={{
          fontSize: 9, padding: "1px 6px", borderRadius: 3,
          background: `${COLORS[color]}11`, color: COLORS[color],
          fontFamily: MONO, border: `1px solid ${COLORS[color]}22`,
        }}>{item}</span>
      ))}
    </div>
  </div>
);

export default function XRPL_OS() {
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ tps: 0, agents: 0, settled: 0, ledgerIndex: 0, wsStatus: "CONNECTING" });
  const [activeLayer, setActiveLayer] = useState(0);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([
    { type: "system", text: "XRPL-OS v0.2.0 — Decentralized Agent Operating System" },
    { type: "system", text: "Kernel: XRPL Mainnet (LIVE) | Network: ILP v4 | Accounting: TigerBeetle" },
    { type: "system", text: "Connecting to wss://s1.ripple.com ..." },
  ]);
  const txRef = useRef(null);
  const termRef = useRef(null);
  const wsRef = useRef(null);
  const txCountRef = useRef(0);
  const ledgerTxCounts = useRef([]);
  const reconnectTimer = useRef(null);

  const addTermLine = useCallback((text, type = "output") => {
    setTerminalHistory(prev => [...prev.slice(-80), { type, text }]);
  }, []);

  const parseTx = useCallback((tx, meta) => {
    const type = tx.TransactionType || "Unknown";
    let amount = "";
    let currency = "XRP";
    let dest = tx.Destination ? tx.Destination.slice(0, 12) + "..." : "—";

    if (tx.Amount) {
      if (typeof tx.Amount === "string") {
        amount = dropsToXRP(tx.Amount);
        currency = "XRP";
      } else if (tx.Amount.value) {
        amount = parseFloat(tx.Amount.value).toFixed(2);
        currency = tx.Amount.currency || "???";
        if (currency.length > 3 && currency.length === 40) currency = "TOKEN";
      }
    } else if (type === "OfferCreate") {
      if (tx.TakerPays) {
        if (typeof tx.TakerPays === "string") {
          amount = dropsToXRP(tx.TakerPays);
          currency = "XRP";
        } else {
          amount = parseFloat(tx.TakerPays.value || 0).toFixed(2);
          currency = tx.TakerPays.currency || "TOKEN";
        }
      }
    }
    if (!amount) amount = "—";

    const result = meta?.TransactionResult || "unknown";
    const success = result === "tesSUCCESS";

    return {
      id: (tx.hash || genId()).slice(0, 8),
      hash: tx.hash || "",
      type, amount, currency, dest,
      account: tx.Account ? tx.Account.slice(0, 12) + "..." : "—",
      status: success ? "settled" : "failed",
      ts: Date.now(),
    };
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= 1) return;
    try {
      const ws = new WebSocket("wss://s1.ripple.com");
      wsRef.current = ws;

      ws.onopen = () => {
        setStats(prev => ({ ...prev, wsStatus: "LIVE" }));
        addTermLine("WebSocket connected to XRPL Mainnet", "success");
        ws.send(JSON.stringify({ command: "subscribe", streams: ["transactions", "ledger"] }));
        addTermLine("Subscribed to transaction + ledger streams", "success");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ledgerClosed") {
            const idx = data.ledger_index;
            const txCount = data.txn_count || 0;
            ledgerTxCounts.current.push({ idx, txCount, ts: Date.now() });
            if (ledgerTxCounts.current.length > 30) ledgerTxCounts.current.shift();
            const recent = ledgerTxCounts.current;
            if (recent.length >= 2) {
              const timeSpan = (recent[recent.length - 1].ts - recent[0].ts) / 1000;
              const totalTx = recent.reduce((sum, l) => sum + l.txCount, 0);
              const tps = timeSpan > 0 ? Math.round(totalTx / timeSpan) : 0;
              setStats(prev => ({ ...prev, tps, ledgerIndex: idx }));
            } else {
              setStats(prev => ({ ...prev, ledgerIndex: idx }));
            }
            setActiveLayer(0);
            return;
          }
          if (data.transaction && data.type === "transaction") {
            const parsed = parseTx(data.transaction, data.meta);
            txCountRef.current++;
            setStats(prev => ({ ...prev, settled: prev.settled + (parsed.status === "settled" ? 1 : 0) }));
            setTransactions(prev => [...prev.slice(-50), parsed]);
            const t = parsed.type;
            if (t === "Payment") setActiveLayer(1);
            else if (t === "OfferCreate" || t === "OfferCancel") setActiveLayer(0);
            else if (t === "TrustSet") setActiveLayer(2);
            else setActiveLayer(3);
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        setStats(prev => ({ ...prev, wsStatus: "DISCONNECTED" }));
        addTermLine("WebSocket disconnected — reconnecting in 3s...", "error");
        reconnectTimer.current = setTimeout(connectWS, 3000);
      };
      ws.onerror = () => {
        setStats(prev => ({ ...prev, wsStatus: "ERROR" }));
      };
    } catch (e) {
      setStats(prev => ({ ...prev, wsStatus: "FAILED" }));
      addTermLine("Connection failed: " + e.message, "error");
      reconnectTimer.current = setTimeout(connectWS, 5000);
    }
  }, [addTermLine, parseTx]);

  useEffect(() => {
    const initialAgents = AGENT_NAMES.slice(0, 6).map(name => ({
      id: genId(), name, state: randomFrom(AGENT_STATES),
      did: "did:xrpl:" + genId(), memory: randomBetween(12, 256),
      txCount: randomBetween(0, 500), uptime: randomBetween(100, 86400),
    }));
    setAgents(initialAgents);
    setStats(prev => ({ ...prev, agents: initialAgents.length }));
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connectWS]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        state: Math.random() > 0.8 ? randomFrom(AGENT_STATES) : a.state,
        txCount: a.state === "SETTLING" ? a.txCount + 1 : a.txCount,
        memory: Math.min(256, a.memory + (Math.random() > 0.9 ? randomBetween(1, 4) : 0)),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (txRef.current) txRef.current.scrollTop = txRef.current.scrollHeight; }, [transactions]);
  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [terminalHistory]);

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
          { type: "output", text: "  stats       — system statistics" },
          { type: "output", text: "  ledger      — current ledger info" },
          { type: "output", text: "  layers      — show OS architecture" },
          { type: "output", text: "  reconnect   — reconnect WebSocket" },
          { type: "output", text: "  clear       — clear terminal" },
        ]; break;
      case "ps":
        output = [{ type: "output", text: "PID    NAME                STATE      DID" }];
        agents.forEach(a => { output.push({ type: "output", text: a.id + "  " + a.name.padEnd(18) + " " + a.state.padEnd(10) + " " + a.did }); });
        break;
      case "spawn": {
        const name = parts[1] || randomFrom(AGENT_NAMES.filter(n => !agents.find(a => a.name === n))) || "Agent_" + genId();
        const na = { id: genId(), name, state: "RUNNING", did: "did:xrpl:" + genId(), memory: 16, txCount: 0, uptime: 0 };
        setAgents(prev => [...prev, na]);
        setStats(prev => ({ ...prev, agents: prev.agents + 1 }));
        output = [{ type: "success", text: "Agent " + name + " spawned [PID: " + na.id + "] [DID: " + na.did + "]" }];
        break;
      }
      case "kill": {
        const target = parts[1];
        const found = agents.find(a => a.id === target || a.name.toLowerCase() === target);
        if (found) {
          setAgents(prev => prev.filter(a => a.id !== found.id));
          setStats(prev => ({ ...prev, agents: prev.agents - 1 }));
          output = [{ type: "error", text: "Agent " + found.name + " terminated [PID: " + found.id + "]" }];
        } else { output = [{ type: "error", text: "Agent not found: " + (target || "(none)") }]; }
        break;
      }
      case "stats":
        output = [
          { type: "output", text: "WebSocket:    " + stats.wsStatus },
          { type: "output", text: "Ledger:       #" + stats.ledgerIndex },
          { type: "output", text: "TPS:          ~" + stats.tps },
          { type: "output", text: "Agents:       " + agents.length },
          { type: "output", text: "Settled TXs:  " + stats.settled },
        ]; break;
      case "ledger":
        output = [
          { type: "output", text: "Current ledger: #" + stats.ledgerIndex },
          { type: "output", text: "Network:        XRPL Mainnet" },
          { type: "output", text: "Endpoint:       wss://s1.ripple.com" },
          { type: "output", text: "Status:         " + stats.wsStatus },
        ]; break;
      case "layers":
        output = [
          { type: "output", text: "┌─────────────────────────────────────────┐" },
          { type: "output", text: "│  L3  Agent Runtime (Processes/DIDs)     │" },
          { type: "output", text: "│  L2  ILP (Network Stack)        [SIM]   │" },
          { type: "output", text: "│  L1  TigerBeetle (Accounting)   [SIM]   │" },
          { type: "output", text: "│  L0  XRPL (Kernel of Value)     [LIVE]  │" },
          { type: "output", text: "└─────────────────────────────────────────┘" },
        ]; break;
      case "reconnect":
        if (wsRef.current) wsRef.current.close();
        setTimeout(connectWS, 500);
        output = [{ type: "system", text: "Reconnecting..." }]; break;
      case "clear": setTerminalHistory([]); return;
      default: output = [{ type: "error", text: "xrpl-os: command not found: " + c }];
    }
    setTerminalHistory(prev => [...prev, { type: "input", text: "$ " + cmd }, ...output]);
  };

  const stateColor = (s) => s === "RUNNING" ? "green" : s === "SETTLING" ? "accent" : s === "WAITING" ? "amber" : "textDim";
  const wsColor = stats.wsStatus === "LIVE" ? "green" : stats.wsStatus === "CONNECTING" ? "amber" : "red";

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: COLORS.bg, fontFamily: SANS, color: COLORS.text, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${COLORS.border};border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: "1px solid " + COLORS.border,
        background: "linear-gradient(180deg, " + COLORS.surfaceLight + " 0%, " + COLORS.surface + " 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, " + COLORS.accent + ", " + COLORS.green + ")",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: COLORS.bg, fontFamily: MONO,
          }}>X</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textBright, letterSpacing: 1, fontFamily: MONO }}>
              XRPL-OS
              <span style={{
                marginLeft: 8, fontSize: 9, padding: "2px 6px", borderRadius: 3,
                background: COLORS[wsColor + "Dim"] || COLORS.greenDim,
                color: COLORS[wsColor], border: "1px solid " + COLORS[wsColor] + "33", fontWeight: 600,
              }}>{stats.wsStatus}</span>
            </div>
            <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, letterSpacing: 0.5 }}>
              Mainnet — Ledger #{stats.ledgerIndex || "..."}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center", zIndex: 1 }}>
          {[
            { label: "TPS", value: "~" + stats.tps, color: "accent" },
            { label: "AGENTS", value: agents.length, color: "green" },
            { label: "SETTLED", value: stats.settled, color: "amber" },
            { label: "LEDGER", value: stats.ledgerIndex ? "#" + stats.ledgerIndex : "...", color: "purple" },
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
        flex: 1, display: "grid", gridTemplateColumns: "220px 1fr 300px",
        gridTemplateRows: "1fr 200px", gap: 1, background: COLORS.border, minHeight: 0,
      }}>
        {/* Left: Architecture */}
        <Panel title="ARCHITECTURE" badge={<LayerBadge color="accent">4 LAYERS</LayerBadge>} style={{ gridRow: "1/3" }}>
          <ArchLayer label="L3 — AGENT RUNTIME" sublabel="Processes / DIDs / Memory" color="green"
            items={["Evernode", "DIDs", "Persistence", "Tasks"]} active={activeLayer === 3} />
          <ArchLayer label="L2 — NETWORK STACK" sublabel="Interledger Protocol" color="purple"
            items={["ILP v4", "STREAM", "Connectors"]} active={activeLayer === 2} />
          <ArchLayer label="L1 — ACCOUNTING" sublabel="Double-Entry Ledger" color="amber"
            items={["TigerBeetle", "Batching", "ACID"]} active={activeLayer === 1} />
          <ArchLayer label="L0 — KERNEL" sublabel="XRPL Consensus (LIVE)" color="accent"
            items={["Consensus", "DEX", "Escrow", "NFTs", "AMM"]} active={activeLayer === 0} />
          <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: "1px solid " + COLORS.border }}>
            <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, marginBottom: 6 }}>DATA SOURCE</div>
            <div style={{ fontSize: 10, color: COLORS.text, fontFamily: SANS, lineHeight: 1.6 }}>
              <span style={{ color: COLORS.green }}>L0</span> → <span style={{ color: COLORS.green }}>LIVE</span> (mainnet)<br />
              <span style={{ color: COLORS.textDim }}>L1</span> → <span style={{ color: COLORS.amber }}>Simulated</span><br />
              <span style={{ color: COLORS.textDim }}>L2</span> → <span style={{ color: COLORS.amber }}>Simulated</span><br />
              <span style={{ color: COLORS.textDim }}>L3</span> → <span style={{ color: COLORS.amber }}>Simulated</span>
            </div>
          </div>
        </Panel>

        {/* Center: Agents */}
        <Panel title="PROCESS TABLE" badge={<LayerBadge color="green">ps -aux</LayerBadge>}
          headerRight={
            <button type="button" onClick={() => handleCommand("spawn")} style={{
              background: COLORS.greenDim, border: "1px solid " + COLORS.green + "44",
              color: COLORS.green, fontSize: 10, fontFamily: MONO, padding: "3px 10px",
              borderRadius: 4, cursor: "pointer",
            }}>+ SPAWN</button>
          }>
          <div style={{ fontSize: 10, fontFamily: MONO }}>
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 70px 120px 50px 50px",
              padding: "4px 0", borderBottom: "1px solid " + COLORS.border,
              color: COLORS.textDim, fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
            }}>
              <span>PID</span><span>NAME</span><span>STATE</span><span>DID</span><span>MEM</span><span>TXs</span>
            </div>
            {agents.map(a => (
              <div key={a.id} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 70px 120px 50px 50px",
                padding: "5px 0", borderBottom: "1px solid " + COLORS.border + "22",
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

        {/* Right: LIVE TX Feed */}
        <Panel title="XRPL TX STREAM" badge={<LayerBadge color={wsColor}>{stats.wsStatus === "LIVE" ? "MAINNET" : stats.wsStatus}</LayerBadge>}>
          <div ref={txRef} style={{ fontSize: 10, fontFamily: MONO }}>
            {transactions.length === 0 && (
              <div style={{ color: COLORS.textDim, textAlign: "center", padding: 20, fontSize: 11 }}>
                {stats.wsStatus === "LIVE" ? "Waiting for transactions..." : "Connecting to XRPL..."}
              </div>
            )}
            {transactions.slice(-25).map((tx, i) => (
              <div key={tx.id + "-" + i} style={{
                padding: "5px 8px", marginBottom: 3, borderRadius: 4,
                background: tx.status === "settled" ? COLORS.greenDim : COLORS.redDim,
                border: "1px solid " + (tx.status === "settled" ? COLORS.green + "22" : COLORS.red + "22"),
                animation: "slideIn 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ color: COLORS.textBright, fontWeight: 500 }}>{tx.type}</span>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: COLORS.textDim }}>{formatTime(tx.ts)}</span>
                    <span style={{
                      fontSize: 8, padding: "1px 5px", borderRadius: 3,
                      background: tx.status === "settled" ? COLORS.greenDim : COLORS.redDim,
                      color: tx.status === "settled" ? COLORS.green : COLORS.red,
                    }}>{tx.status}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.textDim, fontSize: 9 }}>
                  <span>{tx.amount !== "—" ? tx.amount + " " + tx.currency : tx.account}</span>
                  <span>→ {tx.dest}</span>
                </div>
                {tx.hash && (
                  <div style={{ fontSize: 8, color: COLORS.textDim, marginTop: 2, opacity: 0.6 }}>
                    {tx.hash.slice(0, 24)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* Bottom: Terminal */}
        <div style={{ gridColumn: "2/4", display: "flex", flexDirection: "column", background: COLORS.surface }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderBottom: "1px solid " + COLORS.border, background: COLORS.surfaceLight,
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.red }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.amber }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: MONO, color: COLORS.textDim }}>xrpl-os terminal — mainnet</span>
          </div>
          <div ref={termRef} style={{ flex: 1, overflow: "auto", padding: "8px 14px", fontFamily: MONO, fontSize: 11 }}>
            {terminalHistory.map((line, i) => (
              <div key={i} style={{
                color: line.type === "input" ? COLORS.accent : line.type === "success" ? COLORS.green : line.type === "error" ? COLORS.red : line.type === "system" ? COLORS.textDim : COLORS.text,
                fontWeight: line.type === "input" ? 600 : 400, marginBottom: 1, whiteSpace: "pre",
              }}>{line.text}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: "6px 14px", borderTop: "1px solid " + COLORS.border }}>
            <span style={{ color: COLORS.accent, fontFamily: MONO, fontSize: 12, marginRight: 8 }}>$</span>
            <input
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && terminalInput.trim()) { handleCommand(terminalInput.trim()); setTerminalInput(""); } }}
              placeholder="type a command..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: COLORS.textBright, fontFamily: MONO, fontSize: 12 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
