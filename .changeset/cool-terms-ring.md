---
"@zag-js/toast": minor
---

Redesign toast render apis to allow for framework control.

**Some breaking changes:**

- `defaultOptions` can now be passed directly to the `toast.group` machine context.
- You can now pass the default `render` function to the `toast.group` machine context.
- Removed `api.render` in favor of userland control. This eliminates the bug in Solid.js for custom toasts.
