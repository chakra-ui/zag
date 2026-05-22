---
"@zag-js/popper": patch
---

Fix `flip`, `shift`, and `hide` middleware ignoring a late-mounted `boundary`. The boundary is now
re-resolved on every `computePosition` tick, so a function-form `boundary: () => element` picks up
the element once it mounts.
