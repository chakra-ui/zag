---
"@zag-js/svelte": patch
"@zag-js/solid": patch
---

Fixed issue where nested menus didn't open on hover or with the keyboard, or closed as soon as they opened.

- **Solid:** `mergeProps` keeps keys a source adds after the first render.
- **Svelte**
  - Styles set by a component, such as popup positioning, survive re-renders.
  - `normalizeProps` no longer renders a `children` prop as a DOM attribute.
  - Raised the minimum `svelte` peer version to `5.29.0`.
