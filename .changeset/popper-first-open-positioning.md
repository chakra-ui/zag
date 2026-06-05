---
"@zag-js/popper": patch
"@zag-js/popover": patch
"@zag-js/menu": patch
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/cascade-select": patch
"@zag-js/date-picker": patch
"@zag-js/color-picker": patch
"@zag-js/hover-card": patch
"@zag-js/tooltip": patch
"@zag-js/tour": patch
---

Fix positioner appearing in the top-left corner on first open (most visible in the Svelte adapter). The positioner now
stays hidden off-screen via a CSS variable fallback in `transform` instead of a `positioned`-gated `opacity`. This keeps
the framework-managed style static, so reactive re-renders no longer clobber the `--x`/`--y` variables popper sets.

As a result, the internal `positioned` context flag is removed from positioned machines (popover, menu, select, etc.).

Also fixes `cascade-select` positioning: it now sets the initial placement before measuring and defers the first
placement computation (matching the other components), so it positions correctly on open — including `defaultOpen`.
