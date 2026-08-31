---
"@zag-js/menubar": minor
"@zag-js/menu": minor
---

Add the new `@zag-js/menubar` machine for building WAI-ARIA menubars.

Each top-level item is a standalone `menu` machine. Pass `menubarApi.getMenuContext()` to each menu's `menubar` prop so
its trigger behaves as a menubar item.

The menubar coordinates:

- Roving focus across menu triggers
- Open/close state and sibling menu switching
- Nested submenu keyboard behavior
- Horizontal and vertical orientation
- Looping focus and disabled state

```tsx
import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"

const menubarApi = menubar.connect(menubarService, normalizeProps)
const menuService = useMachine(menu.machine, { id: "file", menubar: menubarApi.getMenuContext() })
```
