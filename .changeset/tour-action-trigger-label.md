---
"@zag-js/tour": patch
---

Fix action triggers being announced by the translation instead of their visible label (e.g. "Got it" read as "close
tour"). Pass `attrs: { "aria-label": ... }` on an action to name an icon-only trigger.
