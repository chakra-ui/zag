# @zag-js/menubar

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17),
  [`734b5e8`](https://github.com/chakra-ui/zag/commit/734b5e8e43f03402f5c3d0c283a79d4615e4868b),
  [`e8b99d2`](https://github.com/chakra-ui/zag/commit/e8b99d2af940821a1ff34d086d5f0910c187ec4f),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2
  - @zag-js/core@2.0.0-next.2
  - @zag-js/types@2.0.0-next.2
  - @zag-js/utils@2.0.0-next.2
  - @zag-js/anatomy@2.0.0-next.2

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
