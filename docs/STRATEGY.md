# XRPL-OS — Strategy & Product Doctrine

**Repository:** [Shellfish011235/xrpl-os](https://github.com/Shellfish011235/xrpl-os)

This document is **internal product governance** for builders. It is **not** legal, tax, or investment advice. Public launch requires counsel-approved Terms, Privacy, and risk disclosures.

---

## What XRPL-OS is

A **non-custodial** software layer for **wallets, payments, analytics, automation, and tools** on the [XRP Ledger (XRPL)](https://xrpl.org/). The product story is **software and intelligence first** — not acting as a financial intermediary.

**One-line positioning:** *A non-custodial operating layer for wallets, payments, analytics, automation, and autonomous finance tools built on XRPL.*

Regulators care about **what the product does**, not only what it is called. This doctrine keeps engineering, product, and compliance aligned.

---

## What XRPL-OS is not (by design)

- Not a bank, exchange, or custodian (unless you later restructure with licenses — out of scope for the current open-source read-only app).
- Not a promise of returns, yield, or “passive income.”
- Not silent execution of user funds on a backend: **recommendation ≠ execution** as a first-class boundary.

---

## Current build (as of this repo)

| Area | Status |
|------|--------|
| Mainnet observation | WebSocket to public infrastructure (e.g. `wss://s1.ripple.com`) — read-only |
| Private keys / custody | None in-app |
| Transaction signing | None in-app |
| User fund movement | None in-app |
| L0 (XRPL) in the UI | **LIVE** public data |
| L1–L3 in the shell | Largely **illustrated / simulated** in the current prototype |

This keeps the **current** deployment in a **lower operational-risk band** for a read-only demo.

---

## The hinge: recommendation vs execution

| **Safer (design target)** | **Higher risk (needs structure + legal review)** |
|---------------------------|--------------------------------------------------|
| Detect opportunities, classify flows, explain activity | Execute trades, move user funds, autonomous swaps |
| Simulate, propose treasury actions, AI copilot | Silent routing, backend key use |
| Human-in-the-loop, spend limits, whitelists | Pooled funds, guaranteed yield, custody |

**Crossing into execution** should require, at minimum:

- User wallet signature  
- Explicit consent and per-action approval (where applicable)  
- Revocable sessions  
- Auditable logs  

**Not** hidden server-side execution with access to keys.

---

## Risk zones (product planning)

- **Green (lower risk):** Non-custodial tooling, local signing, analytics, read-only wallet linking, “safe mode” agents (recommend + simulate + approve).  
- **Yellow (moderate):** Auto-routing, one-click bots, rebalancing, cross-asset flows — **legal review before scale**.  
- **Red (high):** Pooled funds, custody, guaranteed returns, opaque spread, lending without structure — **avoid** until fully designed with counsel.

**Florida-based builders:** Engage counsel familiar with Florida money services and digital-asset context when you move beyond read-only software.

---

## Phased roadmap (indicative)

1. **Phase 1 — Clarity & trust**  
   Repository branding, README, docs (this file, architecture), in-app disclaimers, non-custodial narrative, architecture visible in-product.

2. **Phase 2 — Read path**  
   Read-only wallet connect, personal “ledger intelligence” and analytics — still **user-controlled keys**.

3. **Phase 3 — Permissioned agents**  
   Policy engine, approval gates, caps, kill switch, explainability — **execution only through user wallet** where any value moves.

4. **Phase 4 — Business / API** (optional)  
   Enterprise analytics, API access, white-label — each with its own commercial and compliance packaging.

---

## Monetization (non-exclusive)

- **Retail:** Pro dashboards, alerts, AI assistant tiers, automation packs.  
- **Business:** Treasury views, routing *suggestions*, payment operations, API.  
- **Institutional:** Corridor and liquidity intelligence, validator telemetry, compliance-oriented analytics (with appropriate disclaimers and sales process).

---

## Documents before a serious public launch

Work with counsel to ship at least: Terms of Service, Privacy Policy, risk disclosure, non-custodial disclosure, AI/agent disclaimer, jurisdiction / eligibility, and billing/refunds if you charge.

---

## Governance principles

1. **One story** — Product, engineering, and legal narrative must match.  
2. **Software first, not intermediary first** — especially for the open-source and early commercial phases.  
3. **The execution boundary is architectural** — enforce in code and UX, not only in marketing.  
4. **Visibility and accounting truth** are a defensible direction before racing to “more transactions.”

---

*Last updated to match repo “Sprint 1” documentation and in-app compliance banner.*
