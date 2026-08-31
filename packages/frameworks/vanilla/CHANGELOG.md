# @zag-js/vanilla

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252)
  [`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Separate the props you pass to `useMachine` from the
  props the machine sees after defaults are applied.

  - Fixed issue where omitting a required prop type-checked and then failed at runtime with
    `[zag-js] missing required props`. Affects `async-list`, `carousel`, `dnd`, `gridlist`, `listbox`, `pin-input`,
    `select`, `splitter`, `toast` and `toc`, whose required props were reported as optional.
  - Fixed issue where a prop listed as having a default lost `null` from its public type, so props that accept `null`
    rejected it.

  Machine schemas now declare the public props type plus a `defaultPropKey` union naming the props the machine fills in:

  ```ts
  export interface DialogSchema {
    props: DialogProps
    defaultPropKey: PropsWithDefault
  }
  ```

  Schemas that do not declare `defaultPropKey` keep the previous behaviour, so custom machines continue to work
  unchanged.

### Patch Changes

- [#3304](https://github.com/chakra-ui/zag/pull/3304)
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `watchEffect(deps, setup)` to effect implementations, so an
  effect can re-run when the props or context it depends on change, without re-entering the state that owns it. It
  mirrors `track` in `watch`, which runs an action rather than an effect.

  ```ts
  effects: {
    trapFocus({ prop, watchEffect }) {
      return watchEffect([() => prop("trapFocus")], () => {
        if (!prop("trapFocus")) return
        return trapFocus(/* ... */)
      })
    },
  }
  ```

  Only the declared effect restarts, sibling effects and entry actions are untouched, and anything outside the call runs
  once. Deps must return a primitive, the same constraint `track` has, so use `context.hash()` for anything else. Unlike
  Vue's similarly named API, they are explicit rather than auto-tracked.

- Updated dependencies [[`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17),
  [`734b5e8`](https://github.com/chakra-ui/zag/commit/734b5e8e43f03402f5c3d0c283a79d4615e4868b),
  [`e8b99d2`](https://github.com/chakra-ui/zag/commit/e8b99d2af940821a1ff34d086d5f0910c187ec4f),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/core@2.0.0-next.2
  - @zag-js/types@2.0.0-next.2
  - @zag-js/utils@2.0.0-next.2
  - @zag-js/store@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@2.0.0-next.1
  - @zag-js/store@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1

## 2.0.0-next.0

## 1.43.3

### Patch Changes

- Updated dependencies [[`49ef963`](https://github.com/chakra-ui/zag/commit/49ef96354bb412690feacdb7ce7ba0a001b15c13)]:
  - @zag-js/types@1.43.3
  - @zag-js/core@1.43.3
  - @zag-js/store@1.43.3
  - @zag-js/utils@1.43.3

## 1.43.2

### Patch Changes

- Updated dependencies [[`3d019ee`](https://github.com/chakra-ui/zag/commit/3d019eede4ddd578be08f4d097e063b50481224f)]:
  - @zag-js/types@1.43.2
  - @zag-js/utils@1.43.2
  - @zag-js/core@1.43.2
  - @zag-js/store@1.43.2

## 1.43.1

### Patch Changes

- Updated dependencies [[`c42b1d9`](https://github.com/chakra-ui/zag/commit/c42b1d99f22207f9d1958b58a073e79025a0ca21)]:
  - @zag-js/core@1.43.1
  - @zag-js/store@1.43.1
  - @zag-js/types@1.43.1
  - @zag-js/utils@1.43.1

## 1.43.0

### Patch Changes

- Updated dependencies [[`53944e0`](https://github.com/chakra-ui/zag/commit/53944e02589f410f0d4540560b0cf0faa2843b04)]:
  - @zag-js/core@1.43.0
  - @zag-js/store@1.43.0
  - @zag-js/types@1.43.0
  - @zag-js/utils@1.43.0

## 1.42.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.42.0
  - @zag-js/store@1.42.0
  - @zag-js/types@1.42.0
  - @zag-js/utils@1.42.0

## 1.41.2

### Patch Changes

- Updated dependencies [[`5820feb`](https://github.com/chakra-ui/zag/commit/5820febc81934f3d8d17e01f085aafe6dd81fc73)]:
  - @zag-js/types@2.0.0-next.0
  - @zag-js/core@2.0.0-next.0
  - @zag-js/store@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0

## 1.41.0

### Patch Changes

- [`d729dc2`](https://github.com/chakra-ui/zag/commit/d729dc23d3bdb10aaac9e4016503bd6ea49b26b9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix dialog, drawer, and popover leaving `<body>` uninteractive
  (`data-scroll-lock`, `data-inert`, `overflow: hidden`, `pointer-events: none`) after closing under React 19 Strict
  Mode.
- Updated dependencies [[`13cd5d5`](https://github.com/chakra-ui/zag/commit/13cd5d5141022a7212987bd7ccfd9d0999cb905f)]:
  - @zag-js/core@1.41.0
  - @zag-js/store@1.41.0
  - @zag-js/types@1.41.0
  - @zag-js/utils@1.41.0

## 1.40.0

### Patch Changes

- [#3063](https://github.com/chakra-ui/zag/pull/3063)
  [`841296f`](https://github.com/chakra-ui/zag/commit/841296f7f0b64e33175d00ca877333ea5a345023) Thanks
  [@kraus-milan](https://github.com/kraus-milan)! - Machine: Do not use `{}` instead of `undefined` and `null` computed
  value (fixes `accept="[object Object]"` in File Upload with `accept: undefined`)
- Updated dependencies []:
  - @zag-js/core@1.40.0
  - @zag-js/store@1.40.0
  - @zag-js/types@1.40.0
  - @zag-js/utils@1.40.0

## 1.39.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.39.1
  - @zag-js/store@1.39.1
  - @zag-js/types@1.39.1
  - @zag-js/utils@1.39.1

## 1.39.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.39.0
  - @zag-js/store@1.39.0
  - @zag-js/types@1.39.0
  - @zag-js/utils@1.39.0

## 1.38.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.38.2
  - @zag-js/store@1.38.2
  - @zag-js/types@1.38.2
  - @zag-js/utils@1.38.2

## 1.38.1

### Patch Changes

- Updated dependencies [[`2b4818c`](https://github.com/chakra-ui/zag/commit/2b4818c3b82ed1ca8ffd2cb44110a4a195ac68d6)]:
  - @zag-js/core@1.38.1
  - @zag-js/store@1.38.1
  - @zag-js/types@1.38.1
  - @zag-js/utils@1.38.1

## 1.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.38.0
  - @zag-js/store@1.38.0
  - @zag-js/types@1.38.0
  - @zag-js/utils@1.38.0

## 1.37.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.37.0
  - @zag-js/store@1.37.0
  - @zag-js/types@1.37.0
  - @zag-js/utils@1.37.0

## 1.36.0

### Patch Changes

- [#3019](https://github.com/chakra-ui/zag/pull/3019)
  [`4c851ea`](https://github.com/chakra-ui/zag/commit/4c851ead1ee6d35349a9e257be15e31fd79a1292) Thanks
  [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - **Machine**: Fix handling of controlled mode

- Updated dependencies []:
  - @zag-js/core@1.36.0
  - @zag-js/store@1.36.0
  - @zag-js/types@1.36.0
  - @zag-js/utils@1.36.0

## 1.35.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.35.3
  - @zag-js/store@1.35.3
  - @zag-js/types@1.35.3
  - @zag-js/utils@1.35.3

## 1.35.2

### Patch Changes

- Updated dependencies [[`01840ee`](https://github.com/chakra-ui/zag/commit/01840ee6f9672bedc784a2c434b84e8741e2dc25)]:
  - @zag-js/utils@1.35.2
  - @zag-js/core@1.35.2
  - @zag-js/store@1.35.2
  - @zag-js/types@1.35.2

## 1.35.1

### Patch Changes

- Updated dependencies [[`2ab725f`](https://github.com/chakra-ui/zag/commit/2ab725f6cb4631dc8d790a3da53f8fb7713e7ec1)]:
  - @zag-js/core@1.35.1
  - @zag-js/store@1.35.1
  - @zag-js/types@1.35.1
  - @zag-js/utils@1.35.1

## 1.35.0

### Patch Changes

- [#2985](https://github.com/chakra-ui/zag/pull/2985)
  [`b0149ce`](https://github.com/chakra-ui/zag/commit/b0149cea73d2d975d0920d1a69561b6a85c9baa0) Thanks
  [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add comprehensive nested state support and
  coverage. Document hierarchical states in core README, ensure effects/entry/exit ordering for nested transitions, and
  add deep nesting smoke tests across adapters.

- [#2984](https://github.com/chakra-ui/zag/pull/2984)
  [`66ee343`](https://github.com/chakra-ui/zag/commit/66ee343b0e50fc823dc11b26138731f6023f6f6a) Thanks
  [@jramke](https://github.com/jramke)! - Updated vanilla mergeProps function to make sure the style prop is always a
  string

- Updated dependencies [[`b0149ce`](https://github.com/chakra-ui/zag/commit/b0149cea73d2d975d0920d1a69561b6a85c9baa0)]:
  - @zag-js/core@1.35.0
  - @zag-js/store@1.35.0
  - @zag-js/types@1.35.0
  - @zag-js/utils@1.35.0

## 1.34.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.34.1
  - @zag-js/store@1.34.1
  - @zag-js/types@1.34.1
  - @zag-js/utils@1.34.1

## 1.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.34.0
  - @zag-js/store@1.34.0
  - @zag-js/types@1.34.0
  - @zag-js/utils@1.34.0

## 1.33.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.33.1
  - @zag-js/store@1.33.1
  - @zag-js/types@1.33.1
  - @zag-js/utils@1.33.1

## 1.33.0

### Patch Changes

- [#2917](https://github.com/chakra-ui/zag/pull/2917)
  [`8a1d1f3`](https://github.com/chakra-ui/zag/commit/8a1d1f3560cb1d8b1dffb8efab22747004b03d96) Thanks
  [@jramke](https://github.com/jramke)! - - Fix issue where vanilla machines do not have the option to change their
  props during runtime.
  - Fix issue where some `aria-` attributes were toggled as boolean attributes and not as attributes with value strings.
- Updated dependencies []:
  - @zag-js/core@1.33.0
  - @zag-js/store@1.33.0
  - @zag-js/types@1.33.0
  - @zag-js/utils@1.33.0

## 1.32.0

### Minor Changes

- [`19975c3`](https://github.com/chakra-ui/zag/commit/19975c3e49bceefdedbd78c400bdf0aae0c9ed18) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release of the vanilla JavaScript adapter for Zag.js.
  - `VanillaMachine` - Class-based wrapper for zag machines with start/stop lifecycle
  - `normalizeProps` - Converts React-style props to vanilla DOM attributes
  - `spreadProps` - Spreads props onto DOM elements with event listener management

  ```typescript
  import { VanillaMachine, normalizeProps, spreadProps } from "@zag-js/vanilla"
  import * as toggle from "@zag-js/toggle"

  const machine = new VanillaMachine(toggle.machine, { id: "toggle" })
  machine.start()

  const api = toggle.connect(machine.service, normalizeProps)
  spreadProps(buttonEl, api.buttonProps)

  machine.stop()
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.32.0
  - @zag-js/store@1.32.0
  - @zag-js/types@1.32.0
  - @zag-js/utils@1.32.0
