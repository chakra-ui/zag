# @zag-js/core

## 0.1.11

### Patch Changes

- [`61c11646`](https://github.com/chakra-ui/zag/commit/61c116467c1758bdda7efe1f27d4ed26e7d44624) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix TypeScript issues emitted by v4.8

- [#325](https://github.com/chakra-ui/zag/pull/325)
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch packages to use ESM and `type=module`

- Updated dependencies [[`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538)]:
  - @zag-js/store@0.1.3

## 0.1.10

### Patch Changes

- [#269](https://github.com/chakra-ui/zag/pull/269)
  [`ce97956c`](https://github.com/chakra-ui/zag/commit/ce97956c0586ce842f7b082dd71cc6d68909ad58) Thanks
  [@anubra266](https://github.com/anubra266)! - Fix bug in exit effects for `after` transition

* [`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump all packages

* Updated dependencies [[`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d)]:
  - @zag-js/store@0.1.2

## 0.1.9

### Patch Changes

- [`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Trigger new version due to changes in build chain

- Updated dependencies [[`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf)]:
  - @zag-js/store@0.1.1

## 0.1.8

### Patch Changes

- [`c5872be2`](https://github.com/chakra-ui/zag/commit/c5872be2fe057675fb8c7c64ed2c10b99daf697e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix order of execution between root entry-exit and initial state

## 0.1.7

### Patch Changes

- [#178](https://github.com/chakra-ui/zag/pull/178)
  [`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - BREAKING 💥: Refactor connect function in favor of uniform APIs
  across frameworks

  Due to the fact that we tried to make "React" the baseline, there was a lot of inherent complexity in how we managed
  types in the codebase.

  We've now removed the `PropTypes` export in favor of passing `normalizeProps` in the `api.connect` function. This is
  now required for React as well.

  You can remove the `<PropTypes>` generic and Zag will auto-infer the types from `normalizeProps`.

  **For Vue and Solid**

  ```diff
  -api.connect<PropTypes>(state, send, normalizeProps)
  +api.connect(state, send, normalizeProps)
  ```

  **For React**

  ```diff
  -api.connect(state, send)
  +api.connect(state, send, normalizeProps)
  ```

* [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor to use local `@zag-js/store` package

* Updated dependencies [[`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3)]:
  - @zag-js/store@0.1.0

## 0.1.6

### Patch Changes

- [#118](https://github.com/chakra-ui/zag/pull/118)
  [`5982d826`](https://github.com/chakra-ui/zag/commit/5982d826126a7b83252fcd0b0479079fccb62189) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where transition object gets mutated
  - Add `onChange` method to machine to listen for context changes
  - Add support for `debug: true` to visualize state transitions
  - Add support for explicit state re-entry (to get rid of the `after: 0` hack)
- Updated dependencies [[`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed),
  [`ef2872d7`](https://github.com/chakra-ui/zag/commit/ef2872d7b291fa39c6b6293ae12f522d811a2190)]:
  - @zag-js/utils@0.1.2

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
