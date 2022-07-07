# @zag-js/dom-utils

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
