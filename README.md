# XRPL-OS

**A non-custodial intelligence and operations layer for the [XRP Ledger](https://xrpl.org/).**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)  
**Repository:** [github.com/Shellfish011235/xrpl-os](https://github.com/Shellfish011235/xrpl-os)

This project provides **observational tooling and a roadmap-shaped UX** for analytics, future wallet coordination, and permissioned automation — with **no custody of user keys** in the current app.

| Principle | In this build |
|-----------|----------------|
| **No custody** | The app does not store or request private keys. |
| **No signing** | No in-app transaction signing. |
| **No moving user funds** | Read-only mainnet WebSocket; simulated agents / upper layers in the UI. |
| **Execution boundary** | Any future value movement is designed to go **only** through the user’s own wallet and explicit signature — not hidden backend execution. See [docs/STRATEGY.md](./docs/STRATEGY.md). |

*Nothing in this repository is financial, legal, or tax advice.*

---

## Features (directional)

- **Real-time** public mainnet **ledger and transaction** observation (WebSocket)  
- **Process / architecture** view — L0 public data + illustrated L1–L3 layers  
- **In-app** compliance-oriented **disclaimer** and **system architecture** explainer (modal + [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md))  
- **Terminal**-style command surface (demo)  
- **Planned / roadmap:** read-only wallet linking, personal analytics, AI copilots, permissioned agents with human approval and limits  

---

## Quick start

**Requirements:** [Node.js](https://nodejs.org/) 20+ (or current LTS).

```bash
git clone https://github.com/Shellfish011235/xrpl-os.git
cd xrpl-os
npm install
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`).

**Production build:** `npm run build` then `npm run preview` to test the `dist` output.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/STRATEGY.md](./docs/STRATEGY.md) | Product positioning, risk zones, roadmap phases, governance principles |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Data flow, trust boundary, mermaid diagram, layer semantics |

---

## Project structure (high level)

```
src/
  theme.js              # Shared palette / fonts
  XRPL_OS.jsx           # Main shell UI + WebSocket
  DisclaimerBanner.jsx  # Observational / non-custody notice
  ArchitectureModal.jsx # In-app architecture + compliance posture
  App.jsx
  main.jsx
docs/
  STRATEGY.md
  ARCHITECTURE.md
```

---

## License

[MIT](./LICENSE) — see `LICENSE` in the repository root.

---

## Contact

**Maintainer:** [@Shellfish011235](https://github.com/Shellfish011235)  
Issues and PRs welcome for **read-only, non-custodial, transparent** improvements. Proposals that introduce custody, execution-as-a-service, or fund pooling should be discussed with **legal counsel** before implementation.
