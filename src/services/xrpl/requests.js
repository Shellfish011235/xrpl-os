/**
 * Batched public-node requests for a single account. No signing, no submission.
 * @param {import("xrpl").Client} client
 * @param {string} account — classic address
 */
export async function fetchAccountReadBundle(client, account) {
  const accInfo = await client
    .request({ command: "account_info", account, ledger_index: "validated", strict: true })
    .catch((e) => ({ __error: e, __cmd: "account_info" }));

  if (accInfo?.__error) {
    return { accountInfo: accInfo, lines: null, nfts: null, offers: null, objects: null, txs: null };
  }

  const [lines, nfts, offers, objects, txs] = await Promise.all([
    client
      .request({ command: "account_lines", account, ledger_index: "validated" })
      .catch((e) => ({ __error: e, __cmd: "account_lines" })),
    client
      .request({ command: "account_nfts", account, limit: 400, ledger_index: "validated" })
      .catch((e) => ({ __error: e, __cmd: "account_nfts" })),
    client
      .request({ command: "account_offers", account, ledger_index: "validated" })
      .catch((e) => ({ __error: e, __cmd: "account_offers" })),
    client
      .request({
        command: "account_objects",
        account,
        ledger_index: "validated",
        limit: 400,
      })
      .catch((e) => ({ __error: e, __cmd: "account_objects" })),
    client
      .request({
        command: "account_tx",
        account,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 200,
        forward: false,
      })
      .catch((e) => ({ __error: e, __cmd: "account_tx" })),
  ]);

  return {
    accountInfo: accInfo,
    lines,
    nfts,
    offers,
    objects,
    txs,
  };
}
