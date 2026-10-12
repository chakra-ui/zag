---
"@zag-js/svelte": patch
---

Fixed issue where styles set by a component, such as popup positioning, were lost when the element re-rendered. This
made nested menus close as soon as they opened on hover.

- Raised the minimum `svelte` peer version to `5.29.0`
