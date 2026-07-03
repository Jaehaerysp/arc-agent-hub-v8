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