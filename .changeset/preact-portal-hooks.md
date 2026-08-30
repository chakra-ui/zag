---
"@zag-js/preact": patch
---

Fix portalled content failing to render, throwing `Cannot read properties of undefined (reading '__H')`. This affected
every component that portals, including dialog, popover, menu, select and tooltip.

`Portal` imported hooks from `preact/compat`. Bundlers commonly give compat its own copy of the hooks registry, so those
hooks ran with no current component. Hooks now come from `preact/hooks`. `useSyncExternalStore` had the same exposure
and is implemented directly on `preact/hooks` instead of re-exported, with no change in behaviour.
