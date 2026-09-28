---
"@zag-js/focus-visible": patch
---

Fix `Illegal invocation` thrown during setup when another tool has replaced `HTMLElement.prototype.focus` with an
accessor that dereferences `this`. The throw escaped the machine's effect setup, taking the remaining effects down with
it.
