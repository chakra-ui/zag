---
"@zag-js/tabs": patch
---

- Observe the tab list with `ResizeObserver` so the indicator rect updates when the list resizes without individual tab
  triggers changing size (e.g. responsive grid reflow).
