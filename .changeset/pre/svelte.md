---
"@zag-js/svelte": patch
---

- Raise the minimum `svelte` peer version to `5.29.0`.

- Fix nested menus not opening on hover or with the keyboard, or closing as soon as they opened. Styles set by a
  component, such as popup positioning, now survive re-renders.

- Fix `normalizeProps` rendering a `children` prop as a DOM attribute.

- Fix a machine skipping a transition when two events are sent in the same task, which left no slider thumb focused.

- When the same API method is called several times in a row, such as `api.setOpen()`, apply only the last call and fire
  its change callback once, as in React. Read the new state after `tick()`.
