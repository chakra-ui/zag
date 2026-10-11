---
"@zag-js/focus-visible": patch
---

Keep `HTMLElement.prototype.focus` writable when patching and restoring it. When another tool had already defined
`focus` as an accessor (for example Storybook's preview), the redefined method became read-only, so later assignments
(such as react-aria restoring `focus` on `beforeunload`) threw `Cannot assign to read only property 'focus'`.
