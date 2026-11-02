---
"@zag-js/dismissable": patch
"@zag-js/interact-outside": patch
---

- Fix the page freezing when many overlays are open at once.
- Fix closing one overlay also closing unrelated overlays opened after it.
- Fix Escape closing the outer layer first when nested layers open together on mount.
- Fix unmounting nested layers firing `onOpenChange` for children that unmount too.
- Cancel the pending outside-click check when the layer unmounts.
