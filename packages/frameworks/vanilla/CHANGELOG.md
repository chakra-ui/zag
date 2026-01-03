# @zag-js/vanilla

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
