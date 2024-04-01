---
"@zag-js/menu": minor
---

> Breaking changes to the menu component

- Removed `value` and `onValueChange` in favor of using explicit state to manage option items.
- Prefer `value` over `id` in `getItemProps` and `getOptionItemProps` for consistency with other machine.
- `onSelect` now provides `value` not `id` in its details.
