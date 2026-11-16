---
"@zag-js/presence": patch
---

- Fix an issue where closing during the enter animation skipped the exit animation in Chromium and Firefox, because the
  `animationcancel` of the enter animation unmounted the node.
