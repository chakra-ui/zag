# @zag-js/drawer

## 1.41.0

### Patch Changes

- Updated dependencies [[`027d513`](https://github.com/chakra-ui/zag/commit/027d5139da08fe0bf628c40e31dd488f1dde17d1),
  [`d729dc2`](https://github.com/chakra-ui/zag/commit/d729dc23d3bdb10aaac9e4016503bd6ea49b26b9)]:
  - @zag-js/dismissable@1.41.0
  - @zag-js/remove-scroll@1.41.0
  - @zag-js/anatomy@1.41.0
  - @zag-js/core@1.41.0
  - @zag-js/types@1.41.0
  - @zag-js/aria-hidden@1.41.0
  - @zag-js/utils@1.41.0
  - @zag-js/dom-query@1.41.0
  - @zag-js/focus-trap@1.41.0

## 1.40.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.40.0
  - @zag-js/core@1.40.0
  - @zag-js/types@1.40.0
  - @zag-js/aria-hidden@1.40.0
  - @zag-js/utils@1.40.0
  - @zag-js/dismissable@1.40.0
  - @zag-js/dom-query@1.40.0
  - @zag-js/focus-trap@1.40.0
  - @zag-js/remove-scroll@1.40.0

## 1.39.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.39.1
  - @zag-js/core@1.39.1
  - @zag-js/types@1.39.1
  - @zag-js/aria-hidden@1.39.1
  - @zag-js/utils@1.39.1
  - @zag-js/dismissable@1.39.1
  - @zag-js/dom-query@1.39.1
  - @zag-js/focus-trap@1.39.1
  - @zag-js/remove-scroll@1.39.1

## 1.39.0

### Minor Changes

- [#2929](https://github.com/chakra-ui/zag/pull/2929)
  [`024dc75`](https://github.com/chakra-ui/zag/commit/024dc75fdcc377ac74f7a36f8667ac064574fa0d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for multiple triggers in Dialog, Hover Card, Menu,
  Popover, and Tooltip.

  A single component instance can now be shared across multiple trigger elements. Each trigger is identified by a
  `value` passed to `getTriggerProps`:

  ```jsx
  const users = [{ id: 1, name: "Alice Johnson" }]

  const Demo = () => {
    // One dialog, many triggers
    const service = useMachine(dialog.machine, {
      id: useId(),
      // Track the active trigger change
      onTriggerValueChange({ value }) {
        const user = users.find((u) => u.id === value) ?? null
        setActiveUser(user)
      },
    })

    const api = dialog.connect(service, normalizeProps)

    return (
      <>
        {users.map((user) => (
          <button {...api.getTriggerProps({ value: user.id })}>Edit {user.name}</button>
        ))}
      </>
    )
  }
  ```

  When the component is open and a different trigger is activated, it switches and repositions without closing.
  `aria-expanded` is scoped to the active trigger, and focus returns to the correct trigger on close.

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.39.0
  - @zag-js/core@1.39.0
  - @zag-js/types@1.39.0
  - @zag-js/aria-hidden@1.39.0
  - @zag-js/utils@1.39.0
  - @zag-js/dismissable@1.39.0
  - @zag-js/dom-query@1.39.0
  - @zag-js/focus-trap@1.39.0
  - @zag-js/remove-scroll@1.39.0

## 1.38.2

### Patch Changes

- [`f286f35`](https://github.com/chakra-ui/zag/commit/f286f3538e814ce8c39ae9b8c3d87098529ca067) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Avoid setting inline `pointer-events` when modal, letting the
  dismissable layer manage it instead.

- Updated dependencies []:
  - @zag-js/anatomy@1.38.2
  - @zag-js/core@1.38.2
  - @zag-js/types@1.38.2
  - @zag-js/aria-hidden@1.38.2
  - @zag-js/utils@1.38.2
  - @zag-js/dismissable@1.38.2
  - @zag-js/dom-query@1.38.2
  - @zag-js/focus-trap@1.38.2
  - @zag-js/remove-scroll@1.38.2

## 1.38.1

### Patch Changes

- Updated dependencies [[`2b4818c`](https://github.com/chakra-ui/zag/commit/2b4818c3b82ed1ca8ffd2cb44110a4a195ac68d6)]:
  - @zag-js/core@1.38.1
  - @zag-js/anatomy@1.38.1
  - @zag-js/types@1.38.1
  - @zag-js/aria-hidden@1.38.1
  - @zag-js/utils@1.38.1
  - @zag-js/dismissable@1.38.1
  - @zag-js/dom-query@1.38.1
  - @zag-js/focus-trap@1.38.1
  - @zag-js/remove-scroll@1.38.1

## 1.38.0

### Minor Changes

- [`c906c09`](https://github.com/chakra-ui/zag/commit/c906c099997be95d15396fcc5bb5583e9431c2bf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add `description` anatomy part with `aria-describedby` support
  on the content element
  - Add `SwipeArea` part for swipe-to-open gestures from screen edges

    ```tsx
    <div {...api.getSwipeAreaProps()} />
    ```

  - Add `getDescriptionProps()` and `getSwipeAreaProps()` to the connect API
  - Require intentional swipe movement before showing the drawer (no flash on pointer down)
  - Smooth settle animation from release point to fully open position
  - Add cross-axis scroll preservation to prevent drawer drag when scrolling horizontally
  - Fix swipe-to-dismiss in controlled mode (`open: true` without `onOpenChange` now blocks dismiss)
  - Set `pointer-events: none` on positioner in non-modal mode so the page stays interactive
  - Add initial focus management for non-modal mode

### Patch Changes

- Updated dependencies [[`4a395ad`](https://github.com/chakra-ui/zag/commit/4a395adb51b4ef1516acc7d5b03f78fa5130267c)]:
  - @zag-js/dom-query@1.38.0
  - @zag-js/focus-trap@1.38.0
  - @zag-js/core@1.38.0
  - @zag-js/aria-hidden@1.38.0
  - @zag-js/dismissable@1.38.0
  - @zag-js/remove-scroll@1.38.0
  - @zag-js/anatomy@1.38.0
  - @zag-js/types@1.38.0
  - @zag-js/utils@1.38.0

## 1.37.0

### Patch Changes

- [`67aa14b`](https://github.com/chakra-ui/zag/commit/67aa14b89dc88997fee520cfeaf6934ca45f9fb8) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve dialog and drawer focus restoration by preferring the
  trigger element as a stable fallback return target after remount cycles.
- Updated dependencies []:
  - @zag-js/anatomy@1.37.0
  - @zag-js/core@1.37.0
  - @zag-js/types@1.37.0
  - @zag-js/aria-hidden@1.37.0
  - @zag-js/utils@1.37.0
  - @zag-js/dismissable@1.37.0
  - @zag-js/dom-query@1.37.0
  - @zag-js/focus-trap@1.37.0
  - @zag-js/remove-scroll@1.37.0

## 1.36.0

### Patch Changes

- Updated dependencies [[`7edfd5e`](https://github.com/chakra-ui/zag/commit/7edfd5e6ffa0bddde524c9bd43aa157f3fb76b72)]:
  - @zag-js/dom-query@1.36.0
  - @zag-js/core@1.36.0
  - @zag-js/aria-hidden@1.36.0
  - @zag-js/dismissable@1.36.0
  - @zag-js/focus-trap@1.36.0
  - @zag-js/remove-scroll@1.36.0
  - @zag-js/anatomy@1.36.0
  - @zag-js/types@1.36.0
  - @zag-js/utils@1.36.0

## 1.35.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.35.3
  - @zag-js/core@1.35.3
  - @zag-js/types@1.35.3
  - @zag-js/aria-hidden@1.35.3
  - @zag-js/utils@1.35.3
  - @zag-js/dismissable@1.35.3
  - @zag-js/dom-query@1.35.3
  - @zag-js/focus-trap@1.35.3
  - @zag-js/remove-scroll@1.35.3

## 1.35.2

### Patch Changes

- Updated dependencies [[`01840ee`](https://github.com/chakra-ui/zag/commit/01840ee6f9672bedc784a2c434b84e8741e2dc25)]:
  - @zag-js/utils@1.35.2
  - @zag-js/core@1.35.2
  - @zag-js/dismissable@1.35.2
  - @zag-js/anatomy@1.35.2
  - @zag-js/types@1.35.2
  - @zag-js/aria-hidden@1.35.2
  - @zag-js/dom-query@1.35.2
  - @zag-js/focus-trap@1.35.2
  - @zag-js/remove-scroll@1.35.2

## 1.35.1

### Patch Changes

- Updated dependencies [[`2ab725f`](https://github.com/chakra-ui/zag/commit/2ab725f6cb4631dc8d790a3da53f8fb7713e7ec1)]:
  - @zag-js/core@1.35.1
  - @zag-js/anatomy@1.35.1
  - @zag-js/types@1.35.1
  - @zag-js/aria-hidden@1.35.1
  - @zag-js/utils@1.35.1
  - @zag-js/dismissable@1.35.1
  - @zag-js/dom-query@1.35.1
  - @zag-js/focus-trap@1.35.1
  - @zag-js/remove-scroll@1.35.1

## 1.35.0

### Patch Changes

- Updated dependencies [[`b0149ce`](https://github.com/chakra-ui/zag/commit/b0149cea73d2d975d0920d1a69561b6a85c9baa0)]:
  - @zag-js/core@1.35.0
  - @zag-js/anatomy@1.35.0
  - @zag-js/types@1.35.0
  - @zag-js/aria-hidden@1.35.0
  - @zag-js/utils@1.35.0
  - @zag-js/dismissable@1.35.0
  - @zag-js/dom-query@1.35.0
  - @zag-js/focus-trap@1.35.0
  - @zag-js/remove-scroll@1.35.0

## 1.34.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.34.1
  - @zag-js/core@1.34.1
  - @zag-js/types@1.34.1
  - @zag-js/aria-hidden@1.34.1
  - @zag-js/utils@1.34.1
  - @zag-js/dismissable@1.34.1
  - @zag-js/dom-query@1.34.1
  - @zag-js/focus-trap@1.34.1
  - @zag-js/remove-scroll@1.34.1

## 1.34.0

### Minor Changes

- [`76c9a83`](https://github.com/chakra-ui/zag/commit/76c9a832e249929d685659225eeab062f383a4aa) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - **Drawer [New]**: Initial release of the drawer state machine.
  This replaces the previous `bottom-sheet` implementation and API naming.

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.34.0
  - @zag-js/core@1.34.0
  - @zag-js/types@1.34.0
  - @zag-js/aria-hidden@1.34.0
  - @zag-js/utils@1.34.0
  - @zag-js/dismissable@1.34.0
  - @zag-js/dom-query@1.34.0
  - @zag-js/focus-trap@1.34.0
  - @zag-js/remove-scroll@1.34.0

## 1.33.1

### Patch Changes

- Updated dependencies [[`9817e4c`](https://github.com/chakra-ui/zag/commit/9817e4cb3b18d93408b95e7c827d35801b01a267)]:
  - @zag-js/dismissable@1.33.1
  - @zag-js/anatomy@1.33.1
  - @zag-js/core@1.33.1
  - @zag-js/types@1.33.1
  - @zag-js/aria-hidden@1.33.1
  - @zag-js/utils@1.33.1
  - @zag-js/dom-query@1.33.1
  - @zag-js/focus-trap@1.33.1
  - @zag-js/remove-scroll@1.33.1

## 1.33.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.33.0
  - @zag-js/core@1.33.0
  - @zag-js/types@1.33.0
  - @zag-js/aria-hidden@1.33.0
  - @zag-js/utils@1.33.0
  - @zag-js/dismissable@1.33.0
  - @zag-js/dom-query@1.33.0
  - @zag-js/focus-trap@1.33.0
  - @zag-js/remove-scroll@1.33.0

## 1.32.0

### Patch Changes

- Updated dependencies [[`99e18ef`](https://github.com/chakra-ui/zag/commit/99e18ef42866febf205c226ecad3d9210081cdbb),
  [`f824bea`](https://github.com/chakra-ui/zag/commit/f824beac2dcb4c21bdad7520a678d3ae8d208923)]:
  - @zag-js/focus-trap@1.32.0
  - @zag-js/anatomy@1.32.0
  - @zag-js/core@1.32.0
  - @zag-js/types@1.32.0
  - @zag-js/aria-hidden@1.32.0
  - @zag-js/utils@1.32.0
  - @zag-js/dismissable@1.32.0
  - @zag-js/dom-query@1.32.0
  - @zag-js/remove-scroll@1.32.0

## 1.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.31.1
  - @zag-js/core@1.31.1
  - @zag-js/types@1.31.1
  - @zag-js/aria-hidden@1.31.1
  - @zag-js/utils@1.31.1
  - @zag-js/dismissable@1.31.1
  - @zag-js/dom-query@1.31.1
  - @zag-js/focus-trap@1.31.1
  - @zag-js/remove-scroll@1.31.1

## 1.31.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.31.0
  - @zag-js/core@1.31.0
  - @zag-js/types@1.31.0
  - @zag-js/aria-hidden@1.31.0
  - @zag-js/utils@1.31.0
  - @zag-js/dismissable@1.31.0
  - @zag-js/dom-query@1.31.0
  - @zag-js/focus-trap@1.31.0
  - @zag-js/remove-scroll@1.31.0

## 1.30.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.30.0
  - @zag-js/core@1.30.0
  - @zag-js/types@1.30.0
  - @zag-js/aria-hidden@1.30.0
  - @zag-js/utils@1.30.0
  - @zag-js/dismissable@1.30.0
  - @zag-js/dom-query@1.30.0
  - @zag-js/focus-trap@1.30.0
  - @zag-js/remove-scroll@1.30.0

## 1.29.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.29.1
  - @zag-js/core@1.29.1
  - @zag-js/types@1.29.1
  - @zag-js/aria-hidden@1.29.1
  - @zag-js/utils@1.29.1
  - @zag-js/dismissable@1.29.1
  - @zag-js/dom-query@1.29.1
  - @zag-js/focus-trap@1.29.1
  - @zag-js/remove-scroll@1.29.1

## 1.29.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.29.0
  - @zag-js/core@1.29.0
  - @zag-js/types@1.29.0
  - @zag-js/aria-hidden@1.29.0
  - @zag-js/utils@1.29.0
  - @zag-js/dismissable@1.29.0
  - @zag-js/dom-query@1.29.0
  - @zag-js/focus-trap@1.29.0
  - @zag-js/remove-scroll@1.29.0

## 1.28.0

### Patch Changes

- [`c656df8`](https://github.com/chakra-ui/zag/commit/c656df8846733f7b6241d152d76b515a95d6841a) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor to use shared `ResizeObserver` implementation across all
  machines. This significantly improves performance by using a single observer instance with `WeakMap` based
  subscriptions instead of creating separate observers for each component instance.
- Updated dependencies [[`c59e4f5`](https://github.com/chakra-ui/zag/commit/c59e4f5b9bc43de85649d4de95e8bf270c16acab),
  [`c656df8`](https://github.com/chakra-ui/zag/commit/c656df8846733f7b6241d152d76b515a95d6841a)]:
  - @zag-js/dom-query@1.28.0
  - @zag-js/core@1.28.0
  - @zag-js/aria-hidden@1.28.0
  - @zag-js/dismissable@1.28.0
  - @zag-js/focus-trap@1.28.0
  - @zag-js/remove-scroll@1.28.0
  - @zag-js/anatomy@1.28.0
  - @zag-js/types@1.28.0
  - @zag-js/utils@1.28.0

## 1.27.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.27.1
  - @zag-js/core@1.27.1
  - @zag-js/types@1.27.1
  - @zag-js/aria-hidden@1.27.1
  - @zag-js/utils@1.27.1
  - @zag-js/dismissable@1.27.1
  - @zag-js/dom-query@1.27.1
  - @zag-js/focus-trap@1.27.1
  - @zag-js/remove-scroll@1.27.1

## 1.27.0

### Patch Changes

- [`cf6fb09`](https://github.com/chakra-ui/zag/commit/cf6fb0956aeacc236531ee90de9169a39cdde3a5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve support for shadow DOM in all focus trap components
  (dialog, popover, tour, etc.)

- Updated dependencies [[`cf5c238`](https://github.com/chakra-ui/zag/commit/cf5c23893afcccc6e7593fc73346102023245cca),
  [`cf6fb09`](https://github.com/chakra-ui/zag/commit/cf6fb0956aeacc236531ee90de9169a39cdde3a5),
  [`920e727`](https://github.com/chakra-ui/zag/commit/920e727f73940aed3c6d2b886c64200a4a5702d0)]:
  - @zag-js/remove-scroll@1.27.0
  - @zag-js/focus-trap@1.27.0
  - @zag-js/dom-query@1.27.0
  - @zag-js/utils@1.27.0
  - @zag-js/core@1.27.0
  - @zag-js/aria-hidden@1.27.0
  - @zag-js/dismissable@1.27.0
  - @zag-js/anatomy@1.27.0
  - @zag-js/types@1.27.0

## 1.26.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.5
  - @zag-js/core@1.26.5
  - @zag-js/types@1.26.5
  - @zag-js/aria-hidden@1.26.5
  - @zag-js/utils@1.26.5
  - @zag-js/dismissable@1.26.5
  - @zag-js/dom-query@1.26.5
  - @zag-js/focus-trap@1.26.5
  - @zag-js/remove-scroll@1.26.5

## 1.26.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.4
  - @zag-js/core@1.26.4
  - @zag-js/types@1.26.4
  - @zag-js/aria-hidden@1.26.4
  - @zag-js/utils@1.26.4
  - @zag-js/dismissable@1.26.4
  - @zag-js/dom-query@1.26.4
  - @zag-js/focus-trap@1.26.4
  - @zag-js/remove-scroll@1.26.4

## 1.26.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.3
  - @zag-js/core@1.26.3
  - @zag-js/types@1.26.3
  - @zag-js/aria-hidden@1.26.3
  - @zag-js/utils@1.26.3
  - @zag-js/dismissable@1.26.3
  - @zag-js/dom-query@1.26.3
  - @zag-js/focus-trap@1.26.3
  - @zag-js/remove-scroll@1.26.3

## 1.26.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.2
  - @zag-js/core@1.26.2
  - @zag-js/types@1.26.2
  - @zag-js/aria-hidden@1.26.2
  - @zag-js/utils@1.26.2
  - @zag-js/dismissable@1.26.2
  - @zag-js/dom-query@1.26.2
  - @zag-js/focus-trap@1.26.2
  - @zag-js/remove-scroll@1.26.2

## 1.26.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.1
  - @zag-js/core@1.26.1
  - @zag-js/types@1.26.1
  - @zag-js/aria-hidden@1.26.1
  - @zag-js/utils@1.26.1
  - @zag-js/dismissable@1.26.1
  - @zag-js/dom-query@1.26.1
  - @zag-js/focus-trap@1.26.1
  - @zag-js/remove-scroll@1.26.1

## 1.26.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.0
  - @zag-js/core@1.26.0
  - @zag-js/types@1.26.0
  - @zag-js/aria-hidden@1.26.0
  - @zag-js/utils@1.26.0
  - @zag-js/dismissable@1.26.0
  - @zag-js/dom-query@1.26.0
  - @zag-js/focus-trap@1.26.0
  - @zag-js/remove-scroll@1.26.0

## 1.25.0

### Patch Changes

- Updated dependencies [[`b5460d3`](https://github.com/chakra-ui/zag/commit/b5460d3659635c692e9a0e5ae77b0db32af65d46)]:
  - @zag-js/focus-trap@1.25.0
  - @zag-js/aria-hidden@1.25.0
  - @zag-js/anatomy@1.25.0
  - @zag-js/core@1.25.0
  - @zag-js/types@1.25.0
  - @zag-js/utils@1.25.0
  - @zag-js/dismissable@1.25.0
  - @zag-js/dom-query@1.25.0
  - @zag-js/remove-scroll@1.25.0

## 1.24.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.24.2
  - @zag-js/core@1.24.2
  - @zag-js/types@1.24.2
  - @zag-js/aria-hidden@1.24.2
  - @zag-js/utils@1.24.2
  - @zag-js/dismissable@1.24.2
  - @zag-js/dom-query@1.24.2
  - @zag-js/focus-trap@1.24.2
  - @zag-js/remove-scroll@1.24.2

## 1.24.1

### Patch Changes

- Updated dependencies [[`ab0d4f7`](https://github.com/chakra-ui/zag/commit/ab0d4f73d6ca0571cb09ebad5bf724fe81e94ef8)]:
  - @zag-js/core@1.24.1
  - @zag-js/anatomy@1.24.1
  - @zag-js/types@1.24.1
  - @zag-js/aria-hidden@1.24.1
  - @zag-js/utils@1.24.1
  - @zag-js/dismissable@1.24.1
  - @zag-js/dom-query@1.24.1
  - @zag-js/focus-trap@1.24.1
  - @zag-js/remove-scroll@1.24.1

## 1.24.0

### Patch Changes

- [#2710](https://github.com/chakra-ui/zag/pull/2710)
  [`3e293ec`](https://github.com/chakra-ui/zag/commit/3e293ec84a07759d7fd969135360e3b0621bd211) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Re-export missing types

- [#2709](https://github.com/chakra-ui/zag/pull/2709)
  [`2c2211b`](https://github.com/chakra-ui/zag/commit/2c2211bfb87df3203c89502dde2d3439ac12117d) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Fix the issue where controlled props are not working in the bottom
  sheet

- Updated dependencies []:
  - @zag-js/anatomy@1.24.0
  - @zag-js/core@1.24.0
  - @zag-js/types@1.24.0
  - @zag-js/aria-hidden@1.24.0
  - @zag-js/utils@1.24.0
  - @zag-js/dismissable@1.24.0
  - @zag-js/dom-query@1.24.0
  - @zag-js/focus-trap@1.24.0
  - @zag-js/remove-scroll@1.24.0

## 1.23.0

### Patch Changes

- [#2548](https://github.com/chakra-ui/zag/pull/2548)
  [`47011ad`](https://github.com/chakra-ui/zag/commit/47011add7c99572aaa162846cf01781ea42d35ac) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - **[New]** Introduce drawer state machine to show secondary content
  anchored to the bottom of the screen

- Updated dependencies [[`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`352c638`](https://github.com/chakra-ui/zag/commit/352c638b9d2bc9f603f3323a4bb18a87ae3fd9ab),
  [`47011ad`](https://github.com/chakra-ui/zag/commit/47011add7c99572aaa162846cf01781ea42d35ac),
  [`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`50391e1`](https://github.com/chakra-ui/zag/commit/50391e11eb7f9af1f23f44661a8bc522c591175c)]:
  - @zag-js/dom-query@1.23.0
  - @zag-js/focus-trap@1.23.0
  - @zag-js/dismissable@1.23.0
  - @zag-js/core@1.23.0
  - @zag-js/remove-scroll@1.23.0
  - @zag-js/anatomy@1.23.0
  - @zag-js/types@1.23.0
  - @zag-js/aria-hidden@1.23.0
  - @zag-js/utils@1.23.0
