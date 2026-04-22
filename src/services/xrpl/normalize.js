import { dropsToXrp } from "xrpl";
import { safeNumber, round } from "../../lib/numbers.js";

export function isAccountMissingError(err) {
  if (!err) return false;
  if (err.data?.error === "actNotFound") return true;
  if (err.message && String(err.message).toLowerCase().includes("actnotfound")) return true;
  return false;
}

const OBJECT_HINT = {
  Escrow: { label: "escrow" },
  PayChannel: { label: "pay_channel" },
  RippleState: { label: "trust_line" },
  Check: { label: "check" },
  Ticket: { label: "ticket" },
  AMM: { label: "amm" },
  AMMDeposit: { label: "amm_deposit" },
  MPToken: { label: "mp_token" },
};

function getTxResult(meta) {
  if (!meta) return null;
  if (meta.TransactionResult) return meta.TransactionResult;
  if (Array.isArray(meta) && meta[0]?.TransactionResult) return meta[0].TransactionResult;
  return null;
}

function normalizeAmount(amount) {
  if (!amount) return null;
  if (typeof amount === "string") {
    return { xrp: dropsToXrp(amount), currency: "XRP" };
  }
  if (typeof amount === "object" && "value" in amount) {
    return {
      xrp: null,
      currency: String(amount.currency || "UNKNOWN"),
      issuer: amount.issuer || null,
      value: safeNumber(amount.value),
    };
  }
  return null;
}

/**
 * @param {object} entry — account_tx entry
 */
export function normalizeAccountTxEntry(entry) {
  const tx = entry.tx && typeof entry.tx === "string" ? null : entry.tx; // can be object or (binary) — assume json from our request
  const time =
    (typeof entry.date === "number" && entry.date) || (tx && typeof tx.date === "number" ? tx.date : undefined);
  if (!tx || typeof tx === "string") {
    return {
      id: entry.hash || "",
      type: "Unknown",
      from: null,
      to: null,
      amount: null,
      time,
      result: "unknown",
    };
  }
  const t = {
    id: (tx.hash || entry.hash || "").toString().slice(0, 20),
    type: tx.TransactionType || "Unknown",
    from: tx.Account || null,
    to: tx.Destination || null,
    time,
    result: (entry.meta && getTxResult(entry.meta)) || "unknown",
  };
  if (t.type === "Payment" && tx.Amount) t.amount = normalizeAmount(tx.Amount);
  if (t.type === "OfferCreate" || t.type === "OfferCancel") t.desk = "dex";
  return t;
}

function classifyObjects(accountObjects) {
  const byType = {};
  let ammish = 0;
  (accountObjects || []).forEach((o) => {
    const T = o.LedgerEntryType || "Unknown";
    byType[T] = (byType[T] || 0) + 1;
    if (T === "AMM" || T === "AMMDeposit" || T === "AMMBid" || T === "AMMClawback") {
      ammish += 1;
    }
  });
  return {
    counts: byType,
    escrowCount: byType.Escrow || 0,
    ammishCount: ammish,
    otherKeys: Object.keys(OBJECT_HINT),
  };
}

/**
 * Build one wallet snapshot for UI + intelligence. Pure read-only data.
 * @param {string} address
 * @param {import("./requests.js")} raw — from fetchAccountReadBundle
 * @param {object} [opts]
 * @param {string} [opts.ledger] — "validated" etc.
 */
export function buildWalletSnapshot(address, raw) {
  const now = Date.now();
  if (raw?.accountInfo?.__error) {
    const e = raw.accountInfo.__error;
    const m = (e && (e.data?.error_message || e.message)) || "Account not available";
    return {
      address,
      notFound: isAccountMissingError(e) || m.includes("actNotFound") || m.includes("Account not found"),
      errorMessage: String(m),
      xrpDrops: "0",
      xrp: 0,
      ownerCount: 0,
      sequence: 0,
      previousTxnId: null,
      previousTxnLedger: null,
      trustLineCount: 0,
      tokenLines: [],
      nftCount: 0,
      nfts: [],
      openOffersCount: 0,
      offers: [],
      objectProfile: { counts: {}, escrowCount: 0, ammishCount: 0, otherKeys: [] },
      txHistory: [],
      txCountEstimate: 0,
      lastValidLedger: null,
      fetchedAt: now,
    };
  }

  const ad = raw.accountInfo?.result?.account_data;
  const balanceDrops = ad?.Balance || "0";
  const xrp = safeNumber(dropsToXrp(balanceDrops), 0);

  const lineRes = raw.lines?.__error ? { lines: [] } : raw.lines?.result;
  const lines = lineRes?.lines || [];
  const tokenLines = lines.map((l) => ({
    account: l.account,
    balance: l.balance,
    currency: l.currency,
    limit: l.limit,
  }));

  const nftsRes = raw.nfts?.__error ? { account_nfts: [] } : raw.nfts?.result;
  const nfts = nftsRes?.account_nfts || [];
  const firstNftPreview = nfts.slice(0, 12);

  const offersRes = raw.offers?.__error ? { offers: [] } : raw.offers?.result;
  const offers = offersRes?.offers || [];

  const objectsRes = raw.objects?.__error ? { account_objects: [] } : raw.objects?.result;
  const acctObjects = objectsRes?.account_objects || [];
  const objectProfile = classifyObjects(acctObjects);

  const txRes = raw.txs?.__error ? { transactions: [] } : raw.txs?.result;
  const rawTxs = txRes?.transactions || [];
  const history = rawTxs.map((e) => normalizeAccountTxEntry(e));

  return {
    address,
    notFound: false,
    errorMessage: null,
    xrpDrops: balanceDrops,
    xrp: round(xrp, 6),
    ownerCount: ad?.OwnerCount != null ? Number(ad.OwnerCount) : 0,
    sequence: ad?.Sequence != null ? Number(ad.Sequence) : 0,
    previousTxnId: ad?.PreviousTxnID || null,
    previousTxnLedger: ad?.PreviousTxnLgrSeq != null ? Number(ad.PreviousTxnLgrSeq) : null,
    trustLineCount: lines.length,
    tokenLines,
    nftCount: nfts.length,
    nfts: firstNftPreview,
    openOffersCount: offers.length,
    offers: offers.slice(0, 40),
    objectProfile: {
      ...objectProfile,
      objectSampleCount: acctObjects.length,
    },
    txHistory: history,
    txCountEstimate: history.length,
    lastValidLedger: raw.txs?.__error ? null : (txRes?.ledger_index != null ? Number(txRes.ledger_index) : null),
    fetchedAt: now,
  };
}
