# @zag-js/vanilla

## 1.36.0

### Patch Changes

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
