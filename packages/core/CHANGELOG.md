# @zag-js/core

## 0.1.5

### Patch Changes

- [`0d3065e9`](https://github.com/chakra-ui/zag/commit/0d3065e94d707d3161d901576421beae66c32aba) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Extend guard expression to support in guards. In Guards are guards
  that asserts that a machine is in a given state before excusing the transition.
  [Learn more](https://statecharts.dev/glossary/guard.html#in-and-not-in-guards)

  This helper can be used in inline guards or the gaurds options.

  ```js
  import { guards } from "@zag-js/core"

  const { isIn } = gaurds

  const machine = createMachine({
    on: {
      CLICK: {
        guard: isIn("open"),
      },
    },
    states: {
      open: {},
      closed: {},
    },
  })
  ```

* [`587cbec9`](https://github.com/chakra-ui/zag/commit/587cbec9b32ee9e8faef5ceeefb779231b152018) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add the following type utilities:

  - `StateFrom`: To infer the state information from any machine
  - `ContextFrom`: To infer the context information from any machine
  - `EventFrom`: To infer the event types from any machine

## 0.1.4

### Patch Changes

- [#83](https://github.com/chakra-ui/zag/pull/83)
  [`bcf247f1`](https://github.com/chakra-ui/zag/commit/bcf247f18afa5413a7b008f5ab5cbd3665350cb9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor to ensure that the config points to unique references

* [#89](https://github.com/chakra-ui/zag/pull/89)
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add incremental support for shadow root in machines

## 0.1.3

### Patch Changes

- [`46ef565`](https://github.com/chakra-ui/zag/commit/46ef5659a855a382af1e5b0e24d35d03466cfb22) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix symmetry issue between start and stop methods

- Updated dependencies [[`6e175c6`](https://github.com/chakra-ui/zag/commit/6e175c6a69bb70fb78ccdd77a25d83a164298888)]:
  - @zag-js/utils@0.1.1

## 0.1.2

### Patch Changes

- [`3f715bd`](https://github.com/chakra-ui/zag/commit/3f715bdc4f52cdbf71ce9a22a3fc20d31c5fea89) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where computed properties are delete on fast-refresh

## 0.1.1

### Patch Changes

- [`8ef855e`](https://github.com/chakra-ui/zag/commit/8ef855efdf8aaca4355c816cc446bc745e34ec54) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where computed properties doesn't work with `hookSync`
  option.

## 0.1.0

### Minor Changes

- [`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release

### Patch Changes

- Updated dependencies [[`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1)]:
  - @zag-js/utils@0.1.0
