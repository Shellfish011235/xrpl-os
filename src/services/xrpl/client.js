import { Client } from "xrpl";

/** Public read-only mainnet — used only for remote procedure calls, never for signing. */
export const PUBLIC_MAINNET_WSS = "wss://s1.ripple.com";

let _client;
let _connecting;

/**
 * Shared XRPL client (read-only). Safe to call from multiple hooks; connection is idempotent.
 * @returns {Promise<import("xrpl").Client>}
 */
export async function getReadonlyClient() {
  if (_client?.isConnected()) return _client;
  if (_connecting) return _connecting;
  const c = new Client(PUBLIC_MAINNET_WSS);
  _connecting = c
    .connect()
    .then(() => c)
    .finally(() => {
      _connecting = undefined;
    });
  _client = await _connecting;
  return _client;
}

/**
 * @param {(client: import("xrpl").Client) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withClient(fn) {
  const client = await getReadonlyClient();
  return fn(client);
}
