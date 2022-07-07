# @zag-js/tabs

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

- Updated dependencies [[`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253),
  [`ef0c29cf`](https://github.com/chakra-ui/zag/commit/ef0c29cfa874f2fc990872f319affae023bb7cd4),
  [`86155fc0`](https://github.com/chakra-ui/zag/commit/86155fc039cc90fc05c9ce024f8c799e03fde11d),
  [`664e61f9`](https://github.com/chakra-ui/zag/commit/664e61f94844f0405b7e646e4a30b8f0f737f21c),
  [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3),
  [`b91a3a5c`](https://github.com/chakra-ui/zag/commit/b91a3a5cb56f4e25c46fdfcf8ff0fe0a41d75e66)]:
  - @zag-js/core@0.1.7
  - @zag-js/types@0.2.1
  - @zag-js/dom-utils@0.1.6

## 0.1.8

### Patch Changes

- Updated dependencies [[`01a4a520`](https://github.com/chakra-ui/zag/commit/01a4a520abdc2ec88b205acee6d1b25265d5fd3f),
  [`0d2911af`](https://github.com/chakra-ui/zag/commit/0d2911af381bacc9151845e5312f62a5aa2999b2)]:
  - @zag-js/dom-utils@0.1.5
  - @zag-js/types@0.2.0

## 0.1.7

### Patch Changes

- [`dfae8e35`](https://github.com/chakra-ui/zag/commit/dfae8e351f1851d91a2d5508bd1a875be180c73d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Cleanup types

- Updated dependencies [[`f0fb09f9`](https://github.com/chakra-ui/zag/commit/f0fb09f9bfa6a7919d078c66cf14930acab6bdfd),
  [`5982d826`](https://github.com/chakra-ui/zag/commit/5982d826126a7b83252fcd0b0479079fccb62189),
  [`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed),
  [`ef2872d7`](https://github.com/chakra-ui/zag/commit/ef2872d7b291fa39c6b6293ae12f522d811a2190),
  [`63c1e3a9`](https://github.com/chakra-ui/zag/commit/63c1e3a996832ccf55e9a3cc1015d05b6ba927e2)]:
  - @zag-js/dom-utils@0.1.4
  - @zag-js/core@0.1.6
  - @zag-js/utils@0.1.2

## 0.1.6

### Patch Changes

- Updated dependencies [[`cf14f6e9`](https://github.com/chakra-ui/zag/commit/cf14f6e971460bed8a65ae061492446cd47d41c0),
  [`0d3065e9`](https://github.com/chakra-ui/zag/commit/0d3065e94d707d3161d901576421beae66c32aba),
  [`eafec246`](https://github.com/chakra-ui/zag/commit/eafec246b5dfb0c9f4cc421974a8bfa651fe81f0),
  [`587cbec9`](https://github.com/chakra-ui/zag/commit/587cbec9b32ee9e8faef5ceeefb779231b152018)]:
  - @zag-js/types@0.1.2
  - @zag-js/core@0.1.5
  - @zag-js/dom-utils@0.1.3

## 0.1.5

### Patch Changes

- Updated dependencies [[`1274891d`](https://github.com/chakra-ui/zag/commit/1274891dc06ea869dd2db78685aab252b7baec91)]:
  - @zag-js/dom-utils@0.1.2

## 0.1.4

### Patch Changes

- [#89](https://github.com/chakra-ui/zag/pull/89)
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add incremental support for shadow root in machines

- Updated dependencies [[`bcf247f1`](https://github.com/chakra-ui/zag/commit/bcf247f18afa5413a7b008f5ab5cbd3665350cb9),
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0)]:
  - @zag-js/core@0.1.4
  - @zag-js/types@0.1.1

## 0.1.3

### Patch Changes

- Updated dependencies [[`c1a1d41`](https://github.com/chakra-ui/zag/commit/c1a1d4121b5add1b0195633261e9f6b1aca0ff2f),
  [`6e175c6`](https://github.com/chakra-ui/zag/commit/6e175c6a69bb70fb78ccdd77a25d83a164298888),
  [`46ef565`](https://github.com/chakra-ui/zag/commit/46ef5659a855a382af1e5b0e24d35d03466cfb22)]:
  - @zag-js/dom-utils@0.1.1
  - @zag-js/utils@0.1.1
  - @zag-js/core@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`3f715bd`](https://github.com/chakra-ui/zag/commit/3f715bdc4f52cdbf71ce9a22a3fc20d31c5fea89)]:
  - @zag-js/core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`8ef855e`](https://github.com/chakra-ui/zag/commit/8ef855efdf8aaca4355c816cc446bc745e34ec54)]:
  - @zag-js/core@0.1.1

## 0.1.0

### Minor Changes

- [`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release

### Patch Changes

- Updated dependencies [[`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1)]:
  - @zag-js/core@0.1.0
  - @zag-js/types@0.1.0
  - @zag-js/utils@0.1.0
  - @zag-js/dom-utils@0.1.0
