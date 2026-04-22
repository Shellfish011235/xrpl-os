import { useState, useEffect, useRef, useCallback } from "react";
import { PUBLIC_MAINNET_WSS } from "../../services/xrpl/client.js";

const genId = () => Math.random().toString(36).slice(2, 8);

const dropsToXRP = (drops) => {
  if (!drops) return "0";
  const xrp = parseInt(drops, 10) / 1_000_000;
  if (xrp >= 1_000_000) return (xrp / 1_000_000).toFixed(2) + "M";
  if (xrp >= 1_000) return (xrp / 1_000).toFixed(1) + "K";
  return xrp.toFixed(2);
};

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

/**
 * Public mainnet WebSocket: subscribe to validated transactions + ledgers. Read-only observation.
 */
export function useLiveXrplStream() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    tps: 0,
    settled: 0,
    ledgerIndex: 0,
    wsStatus: "CONNECTING",
  });
  const [activeLayer, setActiveLayer] = useState(0);
  const wsRef = useRef(null);
  const connectWSRef = useRef(null);
  const txCountRef = useRef(0);
  const ledgerTxCounts = useRef([]);
  const reconnectTimer = useRef(null);

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
    } else if (type === "OfferCreate" && tx.TakerPays) {
      if (typeof tx.TakerPays === "string") {
        amount = dropsToXRP(tx.TakerPays);
        currency = "XRP";
      } else {
        amount = parseFloat(tx.TakerPays.value || 0).toFixed(2);
        currency = tx.TakerPays.currency || "TOKEN";
      }
    }
    if (!amount) amount = "—";

    const result = meta?.TransactionResult || "unknown";
    const success = result === "tesSUCCESS";

    return {
      id: (tx.hash || genId()).slice(0, 8),
      hash: tx.hash || "",
      type,
      amount,
      currency,
      dest,
      account: tx.Account ? tx.Account.slice(0, 12) + "..." : "—",
      status: success ? "settled" : "failed",
      ts: Date.now(),
    };
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= 1) return;
    try {
      const ws = new WebSocket(PUBLIC_MAINNET_WSS);
      wsRef.current = ws;

      ws.onopen = () => {
        setStats((prev) => ({ ...prev, wsStatus: "LIVE" }));
        ws.send(JSON.stringify({ command: "subscribe", streams: ["transactions", "ledger"] }));
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
              setStats((prev) => ({ ...prev, tps, ledgerIndex: idx }));
            } else {
              setStats((prev) => ({ ...prev, ledgerIndex: idx }));
            }
            setActiveLayer(0);
            return;
          }
          if (data.transaction && data.type === "transaction") {
            const parsed = parseTx(data.transaction, data.meta);
            txCountRef.current += 1;
            setStats((prev) => ({
              ...prev,
              settled: prev.settled + (parsed.status === "settled" ? 1 : 0),
            }));
            setTransactions((prev) => [...prev.slice(-50), parsed]);
            const t = parsed.type;
            if (t === "Payment") setActiveLayer(1);
            else if (t === "OfferCreate" || t === "OfferCancel") setActiveLayer(0);
            else if (t === "TrustSet") setActiveLayer(2);
            else setActiveLayer(3);
          }
        } catch {
          /* non-JSON */
        }
      };

      ws.onclose = () => {
        setStats((prev) => ({ ...prev, wsStatus: "DISCONNECTED" }));
        reconnectTimer.current = setTimeout(() => connectWSRef.current?.(), 3000);
      };
      ws.onerror = () => {
        setStats((prev) => ({ ...prev, wsStatus: "ERROR" }));
      };
    } catch {
      setStats((prev) => ({ ...prev, wsStatus: "FAILED" }));
      reconnectTimer.current = setTimeout(() => connectWSRef.current?.(), 5000);
    }
  }, [parseTx]);

  useEffect(() => {
    connectWSRef.current = connectWS;
  }, [connectWS]);

  useEffect(() => {
    const startId = setTimeout(() => connectWS(), 0);
    return () => {
      clearTimeout(startId);
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connectWS]);

  return {
    transactions,
    stats,
    activeLayer,
    setActiveLayer,
    connectWS,
    formatTime,
  };
}
