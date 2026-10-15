---
"@zag-js/menubar": minor
"@zag-js/menu": minor
---

Added the `@zag-js/menubar` machine for WAI-ARIA menubars. Each top-level item is a standalone `menu` machine; pass
`menubarApi.getMenuContext()` to its `menubar` prop. The menubar handles roving focus, sibling menu switching, nested
submenu keys, orientation, looping and disabled state.

```tsx
const menubarApi = menubar.connect(menubarService, normalizeProps)
const menuService = useMachine(menu.machine, { id: "file", menubar: menubarApi.getMenuContext() })
```

- Switching menus by arrowing or hovering no longer dismisses the incoming menu or replays the open and close
  animations. Positioner and content set `data-instant` during the swap.
- Clicking an open menubar trigger closes its menu.
- A trigger with the native `disabled` attribute is skipped by arrow keys and typeahead, and can't hold the roving tab
  stop.
- `onSelect` receives the clicked item, not only the highlighted one.
