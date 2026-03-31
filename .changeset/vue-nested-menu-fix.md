---
"@zag-js/vue": patch
---

Fix keyboard navigation for nested menus in Vue. ArrowRight now correctly opens submenus when using nested component
patterns (e.g. Ark UI's `Menu.Root` inside `Menu.Root`).
