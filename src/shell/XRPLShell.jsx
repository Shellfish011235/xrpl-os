import { useState } from "react";
import { COLORS, SANS, MONO } from "../theme.js";
import DisclaimerBanner from "../DisclaimerBanner.jsx";
import ArchitectureModal from "../ArchitectureModal.jsx";
import { useLiveXrplStream } from "./hooks/useLiveXrplStream.js";
import { useWalletWatchlist } from "../features/wallet/hooks/useWalletWatchlist.js";
import { useWalletSnapshot } from "../features/wallet/hooks/useWalletSnapshot.js";
import { useWalletIntelligence } from "../features/intelligence/hooks/useWalletIntelligence.js";
import { useDemoAgents } from "./hooks/useDemoAgents.js";
import HeaderBar from "./HeaderBar.jsx";
import ArchitectureSidebar from "./ArchitectureSidebar.jsx";
import LiveNetworkPanel from "./LiveNetworkPanel.jsx";
import TerminalPanel from "./TerminalPanel.jsx";
import DemoAgentsPanel from "./DemoAgentsPanel.jsx";
import WalletWatchPanel from "../features/wallet/components/WalletWatchPanel.jsx";
import WalletSummaryPanel from "../features/wallet/components/WalletSummaryPanel.jsx";
import WalletAssetsPanel from "../features/wallet/components/WalletAssetsPanel.jsx";
import WalletPositionsPanel from "../features/wallet/components/WalletPositionsPanel.jsx";
import IntelligenceOverviewPanel from "../features/intelligence/components/IntelligenceOverviewPanel.jsx";
import WalletHealthPanel from "../features/intelligence/components/WalletHealthPanel.jsx";
import TokenExposurePanel from "../features/intelligence/components/TokenExposurePanel.jsx";
import CounterpartyPanel from "../features/intelligence/components/CounterpartyPanel.jsx";
import ActivityHeatmapPanel from "../features/intelligence/components/ActivityHeatmapPanel.jsx";
import RiskRadarPanel from "../features/intelligence/components/RiskRadarPanel.jsx";
import { formatAgoFromRippleTime } from "../lib/time.js";
import { formatRippleDate } from "../lib/formatters.js";

export default function XRPLShell() {
  const [archOpen, setArchOpen] = useState(false);
  const { watched, selected, add, remove, select } = useWalletWatchlist();
  const activeAddress = selected || (watched[0] ?? null);
  const { snap, loading, error, refetch } = useWalletSnapshot(activeAddress);
  const intel = useWalletIntelligence(snap, activeAddress);
  const { agents, spawn, kill } = useDemoAgents();
  const { transactions, stats, activeLayer, connectWS, formatTime } = useLiveXrplStream();
  const [addHint, setAddHint] = useState("");

  const onWatchAdd = (addr) => {
    const r = add(String(addr).trim());
    if (!r.ok) setAddHint(r.reason);
    else setAddHint(null);
    return r;
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: SANS,
        color: COLORS.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${COLORS.border};border-radius:2px}
      `}</style>
      <DisclaimerBanner />

      <HeaderBar stats={stats} demoAgents={agents.length} onOpenArch={() => setArchOpen(true)} />
      <ArchitectureModal open={archOpen} onClose={() => setArchOpen(false)} />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "minmax(200px, 220px) 1fr minmax(280px, 360px)",
          gridTemplateRows: "minmax(0,1fr) minmax(160px, 220px)",
          gap: 0,
          background: COLORS.border,
        }}
      >
        <ArchitectureSidebar activeLayer={activeLayer} />

        {/* Center: wallet + demo — scrollable */}
        <div
          style={{
            background: COLORS.bg,
            gridColumn: 2,
            gridRow: 1,
            overflow: "auto",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minHeight: 0,
            borderLeft: "1px solid " + COLORS.border,
            borderRight: "1px solid " + COLORS.border,
            borderTop: "1px solid " + COLORS.border,
          }}
        >
          <div style={{ fontSize: 9, color: COLORS.textDim, fontFamily: MONO, padding: "0 2px 2px" }}>
            Read-only analytics — observational only, no transaction submission — watchlist stored locally
          </div>
          {snap?.fetchedAt != null && !loading && activeAddress && !snap?.notFound && (
            <div style={{ fontSize: 8, color: COLORS.textDim, fontFamily: MONO, marginBottom: 2 }}>
              Snapshot: {new Date(snap.fetchedAt).toLocaleString()}{" "}
              {snap?.txHistory?.[0] && " · last tx: " + formatAgoFromRippleTime(snap.txHistory[0].time) + " (" + formatRippleDate(snap.txHistory[0].time) + ")"}
            </div>
          )}
          <WalletWatchPanel
            watchlist={watched}
            onAdd={onWatchAdd}
            onRemove={remove}
            onSelect={select}
            selected={activeAddress}
            inputHint={addHint}
          />
          <WalletSummaryPanel snap={snap} loading={loading} error={error} onRefresh={refetch} address={activeAddress} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <WalletAssetsPanel snap={snap} />
            <WalletPositionsPanel snap={snap} />
          </div>
          <DemoAgentsPanel onSpawn={spawn} agentList={agents} />
        </div>

        {/* Right: intelligence + live stream */}
        <div
          style={{
            background: COLORS.bg,
            gridColumn: 3,
            gridRow: 1,
            overflow: "auto",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minHeight: 0,
            borderTop: "1px solid " + COLORS.border,
          }}
        >
          <IntelligenceOverviewPanel intel={intel} address={activeAddress} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <WalletHealthPanel intel={intel} address={activeAddress} />
            <TokenExposurePanel intel={intel} address={activeAddress} />
          </div>
          <CounterpartyPanel intel={intel} address={activeAddress} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <ActivityHeatmapPanel intel={intel} address={activeAddress} />
            <RiskRadarPanel intel={intel} address={activeAddress} />
          </div>
          <LiveNetworkPanel transactions={transactions} stats={stats} formatTime={formatTime} />
        </div>

        <TerminalPanel
          connectWS={connectWS}
          stats={stats}
          agents={agents}
          onSpawn={spawn}
          onKill={kill}
          onArch={() => setArchOpen(true)}
        />
      </div>
    </div>
  );
}
