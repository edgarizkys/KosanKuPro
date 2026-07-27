# Graph Report - .  (2026-07-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 50 nodes · 63 edges · 9 communities (6 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- showToast
- simulatePaymentSettlement
- updateThemeIcons
- animateCounter
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `showToast()` - 6 edges
2. `simulatePaymentSettlement()` - 5 edges
3. `navigateTo()` - 4 edges
4. `handleLoginSubmit()` - 4 edges
5. `handleComplaintSubmit()` - 4 edges
6. `updateThemeIcons()` - 3 edges
7. `logout()` - 3 edges
8. `toggleRoomStatus()` - 3 edges
9. `renderNotificationLogs()` - 3 edges
10. `initTheme()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleComplaintSubmit()` --calls--> `showToast()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 2_

## Import Cycles
- None detected.

## Communities (9 total, 3 thin omitted)

### Community 1 - "showToast"
Cohesion: 0.29
Nodes (8): closeLoginModal(), handleLoginSubmit(), logout(), navigateTo(), renderRoomGrid(), showToast(), switchRole(), toggleRoomStatus()

### Community 2 - "simulatePaymentSettlement"
Cohesion: 0.33
Nodes (6): closePaymentModal(), handleComplaintSubmit(), renderNotificationLogs(), renderTenantTickets(), renderTransactionLogs(), simulatePaymentSettlement()

### Community 3 - "updateThemeIcons"
Cohesion: 0.67
Nodes (3): initTheme(), toggleTheme(), updateThemeIcons()

## Knowledge Gaps
- **2 isolated node(s):** `state`, `crons`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `showToast` to `app.js`, `simulatePaymentSettlement`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `simulatePaymentSettlement()` connect `simulatePaymentSettlement` to `app.js`, `showToast`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `navigateTo()` connect `showToast` to `app.js`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `state`, `crons` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._