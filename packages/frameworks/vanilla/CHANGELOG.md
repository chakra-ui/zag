# @zag-js/vanilla

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
