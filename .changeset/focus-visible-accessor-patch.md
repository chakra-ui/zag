---
"@zag-js/focus-visible": patch
---

Fix programmatic focus counting as keyboard focus when `HTMLElement.prototype.focus` is an accessor that cannot be read
off the prototype (for example Storybook's instrumented `focus`). The focus patch was skipped in that case, so a
dialog's initial focus turned on focus-visible styles and opened focus-triggered tooltips. The patch now resolves
`focus` through the accessor for each element, and teardown restores the accessor.
