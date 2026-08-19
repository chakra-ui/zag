# @zag-js/menubar

## 2.0.0-next.1

### Minor Changes

- [#3167](https://github.com/chakra-ui/zag/pull/3167)
  [`9d7159a`](https://github.com/chakra-ui/zag/commit/9d7159aca1104d9ec443b6d41f9e8359d526a201) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add the new `@zag-js/menubar` machine for building
  WAI-ARIA menubars.

  Each top-level item is a standalone `menu` machine. Pass `menubarApi.getMenuContext()` to each menu's `menubar` prop
  so its trigger behaves as a menubar item.

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

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.1
  - @zag-js/core@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1
