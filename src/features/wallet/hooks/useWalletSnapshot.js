import { useCallback, useEffect, useState } from "react";
import { withClient } from "../../../services/xrpl/client.js";
import { fetchAccountReadBundle } from "../../../services/xrpl/requests.js";
import { buildWalletSnapshot } from "../../../services/xrpl/normalize.js";
import { isValidWatchAddress } from "../utils/address.js";

/**
 * @param {string | null} address
 */
export function useWalletSnapshot(address) {
  const [snap, setSnap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [req, setReq] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!address || !isValidWatchAddress(address)) {
        if (!cancelled) {
          setSnap(null);
          setError(null);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
      try {
        const raw = await withClient((c) => fetchAccountReadBundle(c, address));
        if (!cancelled) setSnap(buildWalletSnapshot(address, raw));
      } catch (e) {
        if (!cancelled) {
          setSnap(null);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, req]);

  const refetch = useCallback(() => {
    setReq((n) => n + 1);
  }, []);

  return { snap, loading, error, refetch };
}
