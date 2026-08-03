---
"@zag-js/floating-panel": patch
---

Fix panel stacking issues when multiple floating panels are open:

- Closing a panel now removes it from the panel stack (previously only machine destroy did), so the next open panel is
  correctly promoted to topmost.
- The stack index is now applied to the positioner (`z-index` via `--z-index`), so focusing a panel actually brings it
  above sibling panels. Previously the index was only mirrored on the content element, which cannot affect ordering
  across sibling stacking contexts.
