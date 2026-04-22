import { useCallback, useEffect, useState } from "react";
import { isValidWatchAddress } from "../utils/address.js";
import { loadSelectedWallet, loadWatchedWallets, saveSelectedWallet, saveWatchedWallets } from "../utils/walletStorage.js";

/**
 * Read-only watch list (localStorage). No secrets, no connection to signing.
 */
export function useWalletWatchlist() {
  const [watched, setWatched] = useState(() => loadWatchedWallets());
  const [selected, setSelected] = useState(() => {
    const s = loadSelectedWallet();
    if (s && isValidWatchAddress(s)) return s;
    return null;
  });

  useEffect(() => {
    saveWatchedWallets(watched);
  }, [watched]);

  useEffect(() => {
    saveSelectedWallet(selected);
  }, [selected]);

  const add = useCallback((raw) => {
    const t = String(raw).trim();
    if (!isValidWatchAddress(t)) return { ok: false, reason: "That is not a valid classic XRPL address (r...)." };
    setWatched((prev) => {
      if (prev.includes(t)) return prev;
      return [...prev, t].slice(0, 20);
    });
    setSelected(t);
    return { ok: true };
  }, []);

  const remove = useCallback((raw) => {
    const t = String(raw).trim();
    setWatched((prev) => prev.filter((a) => a !== t));
    setSelected((cur) => (cur === t ? null : cur));
  }, []);

  const select = useCallback((raw) => {
    const t = String(raw).trim();
    if (!watched.includes(t) && isValidWatchAddress(t)) {
      setWatched((p) => [...p, t].slice(0, 20));
    }
    if (isValidWatchAddress(t)) setSelected(t);
  }, [watched]);

  return { watched, selected, add, remove, select, setSelected };
}
