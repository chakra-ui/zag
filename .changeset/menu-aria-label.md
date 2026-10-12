---
"@zag-js/menu": patch
---

Fix the `aria-label` prop having no effect on the menu's accessible name. The content no longer sets `aria-labelledby`
to the trigger when `aria-label` is provided, so context menus are no longer named after their trigger area's text.
