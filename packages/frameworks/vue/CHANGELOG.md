# @zag-js/vue

## 0.1.13

### Patch Changes

- Updated dependencies [[`1d30333e`](https://github.com/chakra-ui/zag/commit/1d30333e0d3011707950adab26878cde9ed1c242)]:
  - @zag-js/types@0.2.4

## 0.1.12

### Patch Changes

- [#224](https://github.com/chakra-ui/zag/pull/224)
  [`b7eb3f20`](https://github.com/chakra-ui/zag/commit/b7eb3f204cda6ac913b66787c27942294abfb0ee) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update framework dependencies

## 0.1.11

### Patch Changes

- [`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Trigger new version due to changes in build chain

- Updated dependencies [[`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf)]:
  - @zag-js/core@0.1.9
  - @zag-js/store@0.1.1
  - @zag-js/types@0.2.3

## 0.1.10

### Patch Changes

- [#197](https://github.com/chakra-ui/zag/pull/197)
  [`4ea550d9`](https://github.com/chakra-ui/zag/commit/4ea550d9983e0d20af123481f256cc5cf03d2358) Thanks
  [@anubra266](https://github.com/anubra266)! - Remove `useSetup` hook

* [#196](https://github.com/chakra-ui/zag/pull/196)
  [`146aa136`](https://github.com/chakra-ui/zag/commit/146aa1364dd83f197104fdb2ac27b5a7896b4c8f) Thanks
  [@anubra266](https://github.com/anubra266)! - Improve SSR by omitting `useSetup` step.

* Updated dependencies [[`c5872be2`](https://github.com/chakra-ui/zag/commit/c5872be2fe057675fb8c7c64ed2c10b99daf697e)]:
  - @zag-js/core@0.1.8

## 0.1.9

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

* Updated dependencies [[`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253),
  [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3),
  [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3)]:
  - @zag-js/core@0.1.7
  - @zag-js/store@0.1.0

## 0.1.8

### Patch Changes

- [`8681f47a`](https://github.com/chakra-ui/zag/commit/8681f47a733152e3952ada7f7b66f768e13e2b10) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update to latest vue version

## 0.1.7

### Patch Changes

- Updated dependencies [[`5982d826`](https://github.com/chakra-ui/zag/commit/5982d826126a7b83252fcd0b0479079fccb62189)]:
  - @zag-js/core@0.1.6

## 0.1.6

### Patch Changes

- [`3e920136`](https://github.com/chakra-ui/zag/commit/3e920136c537445a36cf0d04045de1d8ff037ecf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose type utilities to frameworks

* [`9ebe6b45`](https://github.com/chakra-ui/zag/commit/9ebe6b455bfc1b7bf1ad8f770d70ea7656b6c1fe) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove unneeded `Promise.resolve(...)`

* Updated dependencies [[`0d3065e9`](https://github.com/chakra-ui/zag/commit/0d3065e94d707d3161d901576421beae66c32aba),
  [`587cbec9`](https://github.com/chakra-ui/zag/commit/587cbec9b32ee9e8faef5ceeefb779231b152018)]:
  - @zag-js/core@0.1.5

## 0.1.5

### Patch Changes

- [#89](https://github.com/chakra-ui/zag/pull/89)
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add incremental support for shadow root in machines

- Updated dependencies [[`bcf247f1`](https://github.com/chakra-ui/zag/commit/bcf247f18afa5413a7b008f5ab5cbd3665350cb9),
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0)]:
  - @zag-js/core@0.1.4

## 0.1.4

### Patch Changes

- Updated dependencies [[`46ef565`](https://github.com/chakra-ui/zag/commit/46ef5659a855a382af1e5b0e24d35d03466cfb22)]:
  - @zag-js/core@0.1.3

## 0.1.3

### Patch Changes

- Updated dependencies [[`3f715bd`](https://github.com/chakra-ui/zag/commit/3f715bdc4f52cdbf71ce9a22a3fc20d31c5fea89)]:
  - @zag-js/core@0.1.2

## 0.1.2

### Patch Changes

- Updated dependencies [[`8ef855e`](https://github.com/chakra-ui/zag/commit/8ef855efdf8aaca4355c816cc446bc745e34ec54)]:
  - @zag-js/core@0.1.1

## 0.1.1

### Patch Changes

- [`3e145c1`](https://github.com/chakra-ui/zag/commit/3e145c185d598766aae420f724c7759390cb0404) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Export `mergeProps` utility from framework packages

## 0.1.0

### Minor Changes

- [`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release

### Patch Changes

- Updated dependencies [[`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1)]:
  - @zag-js/core@0.1.0
