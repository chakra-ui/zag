---
"@zag-js/menubar": minor
"@zag-js/menu": minor
---

Add the new `@zag-js/menubar` machine for building application menubars (File / Edit / View ...) following the WAI-ARIA menubar pattern.

Each child is a standalone `menu` machine. The menubar exposes `getMenuContext()` — pass its result to each top-level menu's `menubar` prop (usually via a framework context) so the menu's trigger becomes a `menuitem` and coordinates with its siblings:

```tsx
const service = useMachine(menubar.machine, { id: useId() })
const api = menubar.connect(service, normalizeProps)

<MenubarContext.Provider value={api.getMenuContext()}>
  <div {...api.getRootProps()}>
    <Menu id="file" label="File" />
    <Menu id="edit" label="Edit" />
    <Menu id="view" label="View" />
  </div>
</MenubarContext.Provider>

// inside Menu
const menubar = useContext(MenubarContext)
const service = useMachine(menu.machine, { id, menubar })
```

Features:

- Roving tabindex across triggers with `ArrowLeft`/`ArrowRight`, `Home`/`End`, and typeahead
- Hover and arrow-key switching between sibling menus while one is open
- Nested submenus inside a menubar menu: `ArrowRight` opens a submenu when the highlighted item is a submenu trigger, and switches to the next menubar menu when it's a leaf item (even from deep inside a submenu); `ArrowLeft` closes the submenu back to its parent
- `orientation` (`horizontal` or `vertical`), `loopFocus`, and `disabled` props. In a vertical menubar, `Up`/`Down` move between triggers, `ArrowRight` opens a menu (fly-out), and `ArrowLeft` closes it back to its trigger

The `@zag-js/menu` machine accepts an optional `menubar` prop (`{ rootId, disabled?, orientation? }`). When set, the menu acts as a menubar menu and coordinates open/close, focus, and keyboard navigation with the menubar. Omit it for standalone menus and submenus, which are unaffected.
