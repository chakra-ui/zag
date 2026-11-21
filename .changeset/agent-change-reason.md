---
"@zag-js/accordion": patch
"@zag-js/cascade-select": patch
"@zag-js/collapsible": patch
"@zag-js/color-picker": patch
"@zag-js/combobox": patch
"@zag-js/date-picker": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/floating-panel": patch
"@zag-js/hover-card": patch
"@zag-js/menu": patch
"@zag-js/navigation-menu": patch
"@zag-js/popover": patch
"@zag-js/select": patch
"@zag-js/tabs": patch
"@zag-js/tooltip": patch
---

Add `"agent"` to the change reasons that api methods like `setOpen` and `setValue` take. A tool that drives the machines
on an AI agent's behalf can pass it, so the change details report `reason: "agent"` and the app can tell the agent's
change apart from a person's or its own.
