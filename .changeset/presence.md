---
"@zag-js/presence": patch
---

- Fix content staying mounted when its exit animation never fires `animationend`.

- Fix closing during the enter animation skipping the exit animation in Chromium and Firefox.
