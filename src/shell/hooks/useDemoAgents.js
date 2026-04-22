import { useState, useEffect } from "react";

const genId = () => Math.random().toString(36).slice(2, 8);
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const AGENT_NAMES = ["ReportWorker", "ViewAggregator", "IndexSampler", "HeuristicBot", "DataSink", "StreamWatcher"];
const AGENT_STATES = ["IDLE", "SAMPLE", "POLLING", "WAITING"];

/**
 * Local visual demo only. Does not call XRPL.
 */
export function useDemoAgents() {
  const [agents, setAgents] = useState(() =>
    AGENT_NAMES.map((name) => ({
      id: genId(),
      name,
      state: randomFrom(AGENT_STATES),
      did: "did:xrpl:demo:" + genId(),
      memory: randomBetween(12, 64),
      txCount: randomBetween(0, 20),
    })),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          state: Math.random() > 0.85 ? randomFrom(AGENT_STATES) : a.state,
        })),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const spawn = () => {
    setAgents((prev) => [
      ...prev,
      {
        id: genId(),
        name: randomFrom(AGENT_NAMES) + "-" + genId(),
        state: "POLLING",
        did: "did:xrpl:demo:" + genId(),
        memory: 16,
        txCount: 0,
      },
    ]);
  };

  const kill = (idOrName) => {
    setAgents((prev) => prev.filter((a) => a.id !== idOrName && a.name.toLowerCase() !== String(idOrName).toLowerCase()));
  };

  return { agents, spawn, kill };
}
