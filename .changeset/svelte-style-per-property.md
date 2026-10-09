---
"@zag-js/svelte": patch
---

Apply machine styles one property at a time in the browser instead of rewriting the `style` attribute, so properties
machines write to the element directly, such as positioning variables, survive re-renders. This fixes nested menus
closing as soon as they open on hover. Server rendering still outputs a style string.
