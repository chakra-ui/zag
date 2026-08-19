---
"@zag-js/aria-hidden": patch
"@zag-js/dialog": patch
"@zag-js/popover": patch
"@zag-js/drawer": patch
---

Fix background content receiving clicks through a modal overlay when an
underlying element sets `pointer-events: auto`. Content below a modal is now
made `inert` (falling back to `aria-hidden` where `inert` is unsupported), so
it can't be clicked or focused regardless of its `pointer-events` value.
