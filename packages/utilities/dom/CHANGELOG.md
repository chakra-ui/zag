# @zag-js/dom-utils

## 0.2.3

### Patch Changes

- [`18db4fc4`](https://github.com/chakra-ui/zag/commit/18db4fc4d1bdefba3be99da98ff1ac040f09a638) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `getPointPercentRelativeToNode` and `normalizePointValue`
  utilities

- [#467](https://github.com/chakra-ui/zag/pull/467)
  [`de1af599`](https://github.com/chakra-ui/zag/commit/de1af599a515d2b0d09ee7c5d92835088ae05201) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where `requestPointerLock` could throw in a sandbox
  environment
  - Remove unused `createEmitter` and `createListener`
- Updated dependencies [[`c1f609df`](https://github.com/chakra-ui/zag/commit/c1f609dfabbc31c296ebdc1e89480313130f832b)]:
  - @zag-js/types@0.3.3

## 0.2.2

### Patch Changes

- [#462](https://github.com/chakra-ui/zag/pull/462)
  [`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update packages to use explicit `exports` field in `package.json`

- Updated dependencies [[`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822)]:
  - @zag-js/types@0.3.2

## 0.2.1

### Patch Changes

- [#378](https://github.com/chakra-ui/zag/pull/378)
  [`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update typeahead utils to include `isValidEvent` method

- Updated dependencies [[`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999)]:
  - @zag-js/types@0.3.1

## 0.2.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

### Patch Changes

- [#356](https://github.com/chakra-ui/zag/pull/356)
  [`454070e8`](https://github.com/chakra-ui/zag/commit/454070e869619cef905818dfc5248ce60dff94ef) Thanks
  [@anubra266](https://github.com/anubra266)! - - Move `defineDomHelpers` to new package `@zag-js/dom-query`
  - Add `createEmitter` and `createListener` helpers for custom event handling
- Updated dependencies [[`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca)]:
  - @zag-js/types@0.3.0

## 0.1.13

### Patch Changes

- [`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force new release

- Updated dependencies [[`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7)]:
  - @zag-js/types@0.2.7

## 0.1.12

### Patch Changes

- [#325](https://github.com/chakra-ui/zag/pull/325)
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch packages to use ESM and `type=module`

- Updated dependencies [[`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538)]:
  - @zag-js/types@0.2.6

## 0.1.11

### Patch Changes

- [`fc0e34e7`](https://github.com/chakra-ui/zag/commit/fc0e34e705cca1a11c91f46897c523350dfd6f1f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue with home and end keys in rtl

* [#284](https://github.com/chakra-ui/zag/pull/284)
  [`13461057`](https://github.com/chakra-ui/zag/commit/13461057eb161f3991085cd235d74c0857488509) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove redundant helper

- [`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump all packages

* [#284](https://github.com/chakra-ui/zag/pull/284)
  [`13461057`](https://github.com/chakra-ui/zag/commit/13461057eb161f3991085cd235d74c0857488509) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove unneeded utilities

* Updated dependencies [[`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d)]:
  - @zag-js/types@0.2.5

## 0.1.10

### Patch Changes

- Updated dependencies [[`1d30333e`](https://github.com/chakra-ui/zag/commit/1d30333e0d3011707950adab26878cde9ed1c242)]:
  - @zag-js/types@0.2.4

## 0.1.9

### Patch Changes

- [#247](https://github.com/chakra-ui/zag/pull/247)
  [`b3c768cd`](https://github.com/chakra-ui/zag/commit/b3c768cd8605c8964acc966d29075e1f845ee0ff) Thanks
  [@anubra266](https://github.com/anubra266)! - Refactor form utilitities into new package

## 0.1.8

### Patch Changes

- [`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Trigger new version due to changes in build chain

- Updated dependencies [[`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf)]:
  - @zag-js/types@0.2.3

## 0.1.7

### Patch Changes

- [`248a6a03`](https://github.com/chakra-ui/zag/commit/248a6a03d88cedb1f24b6b6cb4ac96444595878f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor live region to own package

* [`0288c362`](https://github.com/chakra-ui/zag/commit/0288c36265fedb9aa77f52817d068bc6ad5723ce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor to use interact outside instead of validate blur

- [#191](https://github.com/chakra-ui/zag/pull/191)
  [`66cb9c99`](https://github.com/chakra-ui/zag/commit/66cb9c998662fd049590d51cfdcd79f03e2f582b) Thanks
  [@anubra266](https://github.com/anubra266)! - - Add `isDocument` query and `defineDomHelpers` method.
  - Improve cases handled by `getDocument`
- Updated dependencies [[`0e750fa1`](https://github.com/chakra-ui/zag/commit/0e750fa1e8d17f495f7d9fda10385819ac762c7b),
  [`66cb9c99`](https://github.com/chakra-ui/zag/commit/66cb9c998662fd049590d51cfdcd79f03e2f582b)]:
  - @zag-js/types@0.2.2

## 0.1.6

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

* [`ef0c29cf`](https://github.com/chakra-ui/zag/commit/ef0c29cfa874f2fc990872f319affae023bb7cd4) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Moved dom related utilities to the `dom-utils` package

- [`86155fc0`](https://github.com/chakra-ui/zag/commit/86155fc039cc90fc05c9ce024f8c799e03fde11d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - improve descriptor utility

* [`664e61f9`](https://github.com/chakra-ui/zag/commit/664e61f94844f0405b7e646e4a30b8f0f737f21c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump `@types/react`

- [#181](https://github.com/chakra-ui/zag/pull/181)
  [`b91a3a5c`](https://github.com/chakra-ui/zag/commit/b91a3a5cb56f4e25c46fdfcf8ff0fe0a41d75e66) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Rename `getOwnerDocument` => `getDocument`
  - Rename `getOwnerWindow` => `getWindow`
- Updated dependencies [[`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253)]:
  - @zag-js/types@0.2.1

## 0.1.5

### Patch Changes

- [#127](https://github.com/chakra-ui/zag/pull/127)
  [`01a4a520`](https://github.com/chakra-ui/zag/commit/01a4a520abdc2ec88b205acee6d1b25265d5fd3f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add helpers for events and shadow root

## 0.1.4

### Patch Changes

- [`f0fb09f9`](https://github.com/chakra-ui/zag/commit/f0fb09f9bfa6a7919d078c66cf14930acab6bdfd) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add option to `getFocusables` and `getTabbables` to include
  container if queried elements is empty

* [`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor package structure

- [`ef2872d7`](https://github.com/chakra-ui/zag/commit/ef2872d7b291fa39c6b6293ae12f522d811a2190) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor utility functions and add fire event utils

* [#118](https://github.com/chakra-ui/zag/pull/118)
  [`63c1e3a9`](https://github.com/chakra-ui/zag/commit/63c1e3a996832ccf55e9a3cc1015d05b6ba927e2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor live-region

* Updated dependencies [[`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed),
  [`ef2872d7`](https://github.com/chakra-ui/zag/commit/ef2872d7b291fa39c6b6293ae12f522d811a2190)]:
  - @zag-js/utils@0.1.2

## 0.1.3

### Patch Changes

- [`eafec246`](https://github.com/chakra-ui/zag/commit/eafec246b5dfb0c9f4cc421974a8bfa651fe81f0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add fieldset monitoring utility

## 0.1.2

### Patch Changes

- [`1274891d`](https://github.com/chakra-ui/zag/commit/1274891dc06ea869dd2db78685aab252b7baec91) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add utility to detect keyboard click

## 0.1.1

### Patch Changes

- [#74](https://github.com/chakra-ui/zag/pull/74)
  [`c1a1d41`](https://github.com/chakra-ui/zag/commit/c1a1d4121b5add1b0195633261e9f6b1aca0ff2f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `findByTypeahead` utility to find items using timeout
  typeahead

  Add `isElementEditable` utility to check if an element is editable

- Updated dependencies [[`6e175c6`](https://github.com/chakra-ui/zag/commit/6e175c6a69bb70fb78ccdd77a25d83a164298888)]:
  - @zag-js/utils@0.1.1

## 0.1.0

### Minor Changes

- [`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release

### Patch Changes

- Updated dependencies [[`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1)]:
  - @zag-js/utils@0.1.0
