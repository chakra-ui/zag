---
"@zag-js/focus-visible": patch
---

- Fix programmatic focus turning on focus-visible styles when `HTMLElement.prototype.focus` is an accessor, as in
  Storybook 10.0–10.5.
