---
"@zag-js/tour": patch
"@zag-js/popper": patch
---

- Fix step navigation events (`next`, `prev`, `setStep`) firing when the tour is inactive, bypassing the `start` flow
- Fix popper styles not being cleaned up when transitioning from a tooltip step to a dialog/non-tooltip step
- Rename `cleanupStyles` option to `restoreStyles` in the popper package
