---
"@zag-js/tabs": patch
---

- **Tabs**
  - Fix the tablist losing its tab stop when no tab is selected or the selected tab is disabled.
  - Fix Home and End deselecting the selected tab when `deselectable` is set.
  - Fix `setValue` clearing the value when `deselectable` is set and the selected tab has focus.
