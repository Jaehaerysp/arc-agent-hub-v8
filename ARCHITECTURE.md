# Architecture

Arc Agent Hub uses a **feature-based architecture**: code is grouped by what it does for the user (agents, reputation, validation…) rather than by technical layer.

```
src/
  app/                    Application shell
    App.jsx               Router + top-level providers
    nav.js                Single source of truth for sidebar/route entries
    providers/
      WalletProvider.jsx  Wraps useWallet(), exposes useWalletContext()
      ThemeProvider.jsx   Dark/light theme, persisted to localStorage
    layout/
      AppLayout.jsx        Sidebar + header + routed page body

  features/               One folder per user-facing feature
    landing/               Public marketing page, mounted at "/" (no wallet gate)
    dashboard/
    agents/
    reputation/
    validation/
    transfer/
    settings/
    developer-tools/
    jobs/                  ERC-8183 job lifecycle (dashboard, create, history, detail)
      JobsPage.jsx          Stats + recent jobs + quick actions
      CreateJobPage.jsx     createJob() then optional setBudget()
      JobHistoryPage.jsx    Search/filter/sort/paginate the full job list
      JobDetailPage.jsx     Full job fields, timeline, next action
      components/
        JobStatusBadge.jsx  Maps the on-chain status enum to a Badge variant
        JobTimeline.jsx     Created → Budget Set → Approved → Funded → Submitted → Completed
        JobActionPanel.jsx  Resolves + renders the single correct next action, role-gated
        JobsTable.jsx       Shared table used by both the dashboard and history page
        JobStats.jsx        computeJobStats() + reusable 7-card stats grid, shared by Dashboard and Jobs
        ActivityFeed.jsx    Reusable activity list, shared by Dashboard (all activity) and Jobs (job-only)
        JobsSearch.jsx      Reusable search box, shared by Job History
        JobsFilters.jsx     Reusable status-filter pills + sort dropdown, shared by Job History
    Each feature exports a single <FeatureName>Page.jsx, lazy-loaded by the router.

  contracts/
    registry.js            Every contract address + ABI + display label — single source of truth
    abis/                  One ABI file per contract

  chains/
    arc.js                 Arc Testnet chain id, RPC, explorer, wallet_addEthereumChain params

  hooks/
    useWallet.js            Wallet connection, network state, activity log, agent id
    useBalances.js          Polls native + ANV balances
    useContractWrite.js      Shared write-transaction lifecycle (loading/error/success/activity)
    useAsyncAction.js        Same lifecycle shape as useContractWrite, generalized to wrap any
                             async function — used by jobs.js calls that do more than one thing
    useJobs.js               Polls the list of jobs (client or provider) for the connected account
    useJob.js                Loads a single job + the connected account's USDC allowance
    useLocalStorage.js       Generic localStorage-backed state
    useCopyToClipboard.js
    useToast.jsx             Toast notification context

  ui/                      Design-system primitives (Button, Card, Field, Alert, Badge,
                            Spinner, EmptyState, StatCard, Skeleton, Dialog, Tooltip, Tabs,
                            CopyButton, ToastViewport, icons)

  lib/
    format.js               shortAddr / shortHash / formatTime / formatTokenAmount / formatExpiry / isExpired

  styles/
    tokens.css              Design tokens (color, type, radius, shadow) — dark + light theme
    base.css                Reset, typography, focus states
    layout.css               App shell layout, responsive breakpoints
    components.css           Design-system component styles
    features.css              Feature-specific styles (dashboard grid, activity list, settings rows…)
    jobs.css                  Jobs module styles (table, timeline, filter bar, pagination) — same tokens, no new palette
```

## Data flow

1. `WalletProvider` creates a single `useWallet()` instance and shares it via context — no prop drilling.
2. Feature pages read wallet state with `useWalletContext()` and read/write contracts through the shared `contracts/registry.js` and `useContractWrite` hook.
3. `useContractWrite` centralizes the try/execute/await-receipt/catch pattern that was previously duplicated across every panel, and logs to the shared activity feed via `addActivity`.
4. Activity and Agent ID persist to `localStorage` through `useLocalStorage`, so they survive reloads.

## Routing

Feature pages are registered once in `app/nav.js` and consumed both by the sidebar and the router in `app/App.jsx`, so adding a feature means adding one entry, not editing multiple files.

`App.jsx` splits routing into two zones: `/` renders `features/landing/LandingPage.jsx` directly, with no wallet requirement. Every other route (`/dashboard`, `/agents`, `/reputation`, `/validation`, `/transfer`, `/settings`, `/developer-tools`) is nested under `AppLayout`, which renders the sidebar/header chrome and gates the page body behind a connected wallet. Unknown paths redirect to `/dashboard`.

Each page is `React.lazy`-loaded, so the initial bundle only includes the Dashboard; other routes are fetched on first visit (see the per-route chunks in `npm run build` output).

## Why a contract registry

The baseline project re-declared the same contract addresses and ABI fragments inside `AgentPanel.jsx`, `ReputationPanel.jsx`, `ValidationPanel.jsx`, and `App.jsx` (four independent copies). `contracts/registry.js` is now the only place addresses are declared; every feature imports from it.

## Known bug fixed in this refactor

`ReputationPanel`'s submit handler called `contract.giveFeedback(...)` **twice** — once with the result discarded, once awaited — so every feedback submission sent two separate on-chain transactions. The new `ReputationPage` calls it exactly once through `useContractWrite`.

## ERC-8183 Agentic Commerce (Sprint 1)

The verified ERC-8183 SDK (a standalone Node.js toolkit for testing the Agentic Commerce job lifecycle on Arc Testnet) has been folded into the app as `src/lib/blockchain/`:

```
lib/blockchain/
  constants.js    AGENTIC_COMMERCE_ADDRESS, USDC_ADDRESS, JOB_STATUS — chain id/RPC/explorer
                  are NOT duplicated here, they're imported from chains/arc.js
  abis.js         AGENTIC_COMMERCE_ABI, USDC_ABI — carried over unchanged from the SDK
  contracts.js    ERC8183_CONTRACTS registry + getCommerceContract()/getUsdcContract()
                  factories, mirroring contracts/registry.js's shape
  helpers.js      hashText() (keccak256), formatJob() (tuple → plain object)
  jobs.js         createJob/setBudget/approveUsdc/fundJob/submitDeliverable/
                  completeJob/getJob — one function per verified script
  index.js        barrel export
```

**One deliberate change from the SDK, and why:** the SDK's scripts sign transactions with raw private keys loaded from a `.env` file (`CLIENT_PRIVATE_KEY` / `PROVIDER_PRIVATE_KEY`) — a Node-only pattern appropriate for a CLI testing tool. That pattern is **not** ported into the app. A browser app must never hold a private key, so every write function in `jobs.js` instead takes a `signer` argument — the same connected-wallet `ethers.Signer` that `AgentsPage`, `ReputationPage`, `ValidationPage` and `TransferPage` already pull from `useWalletContext()`. Likewise, the SDK's `storage.ts` persisted the active job id to a local `job.json` file; the browser has no filesystem, so job ids are simply passed as normal values (route params, form state, or the existing `useLocalStorage` hook) instead.

A second adaptation: the SDK is written in TypeScript (`.ts`), but this project's Vite/ESLint toolchain is plain JavaScript (`.jsx`/`.js`, no `tsconfig`, no TS build step). The blockchain lib is therefore implemented as `.js` with the same structure and JSDoc-style comments, rather than introducing a parallel TypeScript toolchain for one folder.

Contract addresses, ABI signatures, and call arguments are otherwise carried over unchanged and re-verified against the working SDK scripts.

## ERC-8183 Agentic Commerce — job lifecycle UI (Sprint 2)

`/jobs`, `/jobs/create`, `/jobs/history`, and `/jobs/:id` now render the full job lifecycle instead of the Sprint 1 placeholder, wired to `lib/blockchain/jobs.js` the same way `AgentsPage` is wired to `useContractWrite`.

**Job discovery.** The verified SDK only exposes `getJob(id)` — there's no "list jobs" call. `listJobsForAccount()` (added to `lib/blockchain/jobs.js`, alongside the seven verified functions, none of which were changed) fills that gap by reading `JobCreated` logs — `jobId`, `client` and `provider` are all indexed — for jobs where the connected account is client or provider, then resolves each id with the existing `getJob()`. It's a read-only addition; no write path was touched.

**Status model.** The on-chain `Job.status` enum only has `Open → Funded → Submitted → Completed` (plus terminal `Rejected`/`Expired`) — there's no "Budget Set" or "Approved" status on-chain. Those two are derived client-side while a job is `Open`: `budget === 0n` → *Set Budget* is next; else `allowance(client, AgenticCommerce) < budget` → *Approve USDC* is next; else → *Fund Job* is next. `JobActionPanel` resolves this into a single next action per job and role-gates it against the connected wallet (client for setBudget/approve/fund, provider for submit, evaluator — or client if no evaluator was set — for complete), disabling the action with an explanation if the wrong wallet is connected rather than hiding it.

**Create Job.** The form's "Budget (USDC)" field isn't a `createJob()` parameter on-chain — budget is set in a separate `setBudget()` call. `CreateJobPage` chains the two verified calls (`createJob()` then, if a budget was entered, `setBudget()`) so entering a budget at creation "just works," while still only ever calling the verified SDK functions. If the second call fails, the job still exists and a toast points the user to the job page, where `JobActionPanel` will correctly offer *Set Budget* again.

**Error handling.** Wallet-not-connected and wrong-network are already handled globally (`AppLayout`'s `ConnectPrompt` / "Switch to Arc" banner). Within the Jobs pages: `useJob`/`useJobs` surface RPC/read failures as an `Alert` with a `Refresh` retry; `useAsyncAction` (same error-extraction convention as `useContractWrite`: `e.reason || e.shortMessage || e.message`) surfaces user-rejected transactions and contract reverts inline on the action button; every successful write links to its ArcScan transaction.
