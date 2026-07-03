# Arc Agent Hub Release Checklist

## v6.0.0-m2 — Navigation & Layout

## Build

- [x] npm install — 381 packages, clean
- [x] npm run build — succeeds, 253 modules transformed
- [x] npm run lint — 0 errors, 6 pre-existing warnings (unrelated files, unchanged)
- [x] npm test — 5 files / 31 tests passed

## Visual QA
Shell-only milestone — page content unchanged, verified pages still render
correctly inside the new shell:

- [x] Dashboard
- [ ] Marketplace (route not present in this build — N/A)
- [x] Jobs
- [x] Reputation
- [x] Validation
- [x] Transfer
- [x] Settings
- [x] Developer Tools

## Responsive

- [x] Desktop (>=1100px) — persistent full sidebar, user-toggleable collapse
- [x] Tablet (720–1099px) — sidebar forced to icon rail, always persistent
- [x] Mobile (<720px) — sidebar becomes off-canvas drawer with scrim

## Accessibility

- [x] Keyboard — command palette (⌘K/Ctrl+K, arrow keys, Enter, Esc), full nav tab order
- [x] Focus — global :focus-visible retained; nav items and icon buttons focus-visible
- [x] Contrast — reused existing token system (already WCAG AA per Design Vision §12)

## Git

- [ ] Commit
- [ ] Tag
- [ ] Push

---

## v6.0.0-m3 — Mission Control Dashboard

## Build

- [ ] npm install — **not run**: this build environment has no network egress
      (registry.npmjs.org returns `403 host_not_allowed`), so `node_modules`
      could not be installed here. No dependencies were added or changed —
      `package.json` is untouched — so `npm install` should still resolve
      cleanly against v6.0.0-m2's lockfile.
- [ ] npm run build — not run, same reason. All new/changed files were
      reviewed manually for import-path correctness, JSX validity, and
      prop-shape consistency (see Files Modified / Files Added in the
      accompanying summary).
- [ ] npm run lint — not run, same reason. Manually checked against the
      project's `.eslintrc.cjs` rules (no unused imports, hooks called
      unconditionally at the top of components, no undeclared JSX props).
- [ ] npm test — not run, same reason. `dashboardLogic.test.js` was added
      alongside the new logic, following the existing `computeJobStats`
      test's structure and style, and mirrors DashboardPage's real call
      shape (see `cellsFor()` helper in the test file).

**Action for the team:** run `npm install && npm run build && npm run lint && npm test`
locally or in CI before merging, and check these boxes once green.

## Visual QA

Mission Control replaces the Dashboard route only:

- [ ] Mission Hero — greeting, network, wallet, ANV balance, live clock
- [ ] Mission Status strip — all 6 cells (Agent Health, Jobs Running, Trust,
      Escrow, Network, System), overall ribbon color
- [ ] Needs your attention — action items + empty "all caught up" state
- [ ] Live activity (existing component, reused unchanged)
- [ ] Your agents — registered-agent card + empty "register" invite state
- [ ] Quick actions — all 5 tiles route correctly

Not touched, should render exactly as in m2: Marketplace/Agents, Jobs,
Reputation, Validation, Transfer, Settings, Developer Tools.

## Responsive

- [ ] Desktop (>=1100px) — 6-across Mission Status strip, 5-across quick actions
- [ ] Tablet (720–1099px) — 3-across status cells, 3-across quick actions
- [ ] Mobile (<720px) — 2-across status cells, 2-across quick actions, hero
      facts wrap without dividers

## Accessibility

- [ ] Keyboard — every card/button in the new sections is a real
      `<button>`/interactive `Card` reachable via Tab, with the existing
      global `:focus-visible` styles
- [ ] Status is never color-only — every Mission Status cell and attention
      item pairs its color with a text label
- [ ] Contrast — reused the existing token system (no new colors introduced)

## Git

- [ ] Commit
- [ ] Tag
- [ ] Push