---
"@zag-js/focus-visible": patch
---

Fix `Illegal invocation` thrown during setup when another tool has replaced `HTMLElement.prototype.focus` with an
accessor that dereferences `this` (Storybook's instrumenter does this). The throw escaped the machine's effect setup,
which took the rest of the component's effects — positioning included — down with it. Reading the native `focus` is now
part of the guarded patch, and the interaction listeners are registered either way.
