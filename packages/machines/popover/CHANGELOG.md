# @zag-js/popover

## 0.1.13

### Patch Changes

- Updated dependencies [[`1d30333e`](https://github.com/chakra-ui/zag/commit/1d30333e0d3011707950adab26878cde9ed1c242)]:
  - @zag-js/types@0.2.4
  - @zag-js/dismissable@0.1.3
  - @zag-js/popper@0.1.10
  - @zag-js/remove-scroll@0.1.3

## 0.1.12

### Patch Changes

- Updated dependencies [[`33258f92`](https://github.com/chakra-ui/zag/commit/33258f92e3e1c9943a7507f252b40af2fd085788)]:
  - @zag-js/popper@0.1.10
  - @zag-js/dismissable@0.1.3
  - @zag-js/remove-scroll@0.1.3

## 0.1.11

### Patch Changes

- [`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Trigger new version due to changes in build chain

- Updated dependencies [[`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf)]:
  - @zag-js/core@0.1.9
  - @zag-js/types@0.2.3
  - @zag-js/aria-hidden@0.1.1
  - @zag-js/dismissable@0.1.3
  - @zag-js/popper@0.1.9
  - @zag-js/remove-scroll@0.1.3

## 0.1.10

### Patch Changes

- [#202](https://github.com/chakra-ui/zag/pull/202)
  [`ef8a7386`](https://github.com/chakra-ui/zag/commit/ef8a7386ccf4de3431c785b310670da105788597) Thanks
  [@anubra266](https://github.com/anubra266)! - Refactor machine dom to use `getById`

* [#191](https://github.com/chakra-ui/zag/pull/191)
  [`66cb9c99`](https://github.com/chakra-ui/zag/commit/66cb9c998662fd049590d51cfdcd79f03e2f582b) Thanks
  [@anubra266](https://github.com/anubra266)! - Improve SSR by omitting the setup step.

* Updated dependencies [[`0e750fa1`](https://github.com/chakra-ui/zag/commit/0e750fa1e8d17f495f7d9fda10385819ac762c7b),
  [`569d98e1`](https://github.com/chakra-ui/zag/commit/569d98e186dc95c97b1b897b6cc0183065646031),
  [`66cb9c99`](https://github.com/chakra-ui/zag/commit/66cb9c998662fd049590d51cfdcd79f03e2f582b),
  [`c5872be2`](https://github.com/chakra-ui/zag/commit/c5872be2fe057675fb8c7c64ed2c10b99daf697e)]:
  - @zag-js/types@0.2.2
  - @zag-js/dismissable@0.1.2
  - @zag-js/core@0.1.8
  - @zag-js/popper@0.1.8
  - @zag-js/remove-scroll@0.1.2

## 0.1.9

### Patch Changes

- [#181](https://github.com/chakra-ui/zag/pull/181)
  [`b91a3a5c`](https://github.com/chakra-ui/zag/commit/b91a3a5cb56f4e25c46fdfcf8ff0fe0a41d75e66) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for nested popovers by leveraging the layer stack
  approach

* [#178](https://github.com/chakra-ui/zag/pull/178)
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

- [`dd547f51`](https://github.com/chakra-ui/zag/commit/dd547f512f503c8e68e178aca91ed27fd9c82b46) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update naming convention for initial state property

* [`664e61f9`](https://github.com/chakra-ui/zag/commit/664e61f94844f0405b7e646e4a30b8f0f737f21c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Pin dependency versions

* Updated dependencies [[`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253),
  [`ef0c29cf`](https://github.com/chakra-ui/zag/commit/ef0c29cfa874f2fc990872f319affae023bb7cd4),
  [`86155fc0`](https://github.com/chakra-ui/zag/commit/86155fc039cc90fc05c9ce024f8c799e03fde11d),
  [`664e61f9`](https://github.com/chakra-ui/zag/commit/664e61f94844f0405b7e646e4a30b8f0f737f21c),
  [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3),
  [`664e61f9`](https://github.com/chakra-ui/zag/commit/664e61f94844f0405b7e646e4a30b8f0f737f21c),
  [`b91a3a5c`](https://github.com/chakra-ui/zag/commit/b91a3a5cb56f4e25c46fdfcf8ff0fe0a41d75e66)]:
  - @zag-js/core@0.1.7
  - @zag-js/types@0.2.1
  - @zag-js/dom-utils@0.1.6
  - @zag-js/popper@0.1.7
  - @zag-js/remove-scroll@0.1.1

## 0.1.8

### Patch Changes

- Updated dependencies [[`2cc4185f`](https://github.com/chakra-ui/zag/commit/2cc4185f25fffc2d20a2376e5b905ace80aa585a),
  [`01a4a520`](https://github.com/chakra-ui/zag/commit/01a4a520abdc2ec88b205acee6d1b25265d5fd3f),
  [`0d2911af`](https://github.com/chakra-ui/zag/commit/0d2911af381bacc9151845e5312f62a5aa2999b2)]:
  - @zag-js/popper@0.1.6
  - @zag-js/dom-utils@0.1.5
  - @zag-js/types@0.2.0

## 0.1.7

### Patch Changes

- [`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update to use local remove scroll package

* [`dfae8e35`](https://github.com/chakra-ui/zag/commit/dfae8e351f1851d91a2d5508bd1a875be180c73d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Cleanup types

- [`f0fb09f9`](https://github.com/chakra-ui/zag/commit/f0fb09f9bfa6a7919d078c66cf14930acab6bdfd) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where focus doesn't get set on the content when the
  popover includes non-focusable descendants

* [#114](https://github.com/chakra-ui/zag/pull/114)
  [`86b8600e`](https://github.com/chakra-ui/zag/commit/86b8600e4996386a21700deb5b04d9b82e8525eb) Thanks
  [@alexluong](https://github.com/alexluong)! - Add `open` to dialog context to allow user open dialog initially

* Updated dependencies [[`f0fb09f9`](https://github.com/chakra-ui/zag/commit/f0fb09f9bfa6a7919d078c66cf14930acab6bdfd),
  [`5982d826`](https://github.com/chakra-ui/zag/commit/5982d826126a7b83252fcd0b0479079fccb62189),
  [`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed),
  [`ef2872d7`](https://github.com/chakra-ui/zag/commit/ef2872d7b291fa39c6b6293ae12f522d811a2190),
  [`63c1e3a9`](https://github.com/chakra-ui/zag/commit/63c1e3a996832ccf55e9a3cc1015d05b6ba927e2),
  [`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed)]:
  - @zag-js/dom-utils@0.1.4
  - @zag-js/core@0.1.6
  - @zag-js/utils@0.1.2
  - @zag-js/remove-scroll@0.1.0
  - @zag-js/popper@0.1.5

## 0.1.6

### Patch Changes

- Updated dependencies [[`cf14f6e9`](https://github.com/chakra-ui/zag/commit/cf14f6e971460bed8a65ae061492446cd47d41c0),
  [`0d3065e9`](https://github.com/chakra-ui/zag/commit/0d3065e94d707d3161d901576421beae66c32aba),
  [`eafec246`](https://github.com/chakra-ui/zag/commit/eafec246b5dfb0c9f4cc421974a8bfa651fe81f0),
  [`587cbec9`](https://github.com/chakra-ui/zag/commit/587cbec9b32ee9e8faef5ceeefb779231b152018)]:
  - @zag-js/types@0.1.2
  - @zag-js/core@0.1.5
  - @zag-js/dom-utils@0.1.3
  - @zag-js/popper@0.1.4

## 0.1.5

### Patch Changes

- [#100](https://github.com/chakra-ui/zag/pull/100)
  [`3fe2db54`](https://github.com/chakra-ui/zag/commit/3fe2db5482de26cfa0406e32f9a1c768f56b0002) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-expanded` to popover content props

- Updated dependencies [[`3fe2db54`](https://github.com/chakra-ui/zag/commit/3fe2db5482de26cfa0406e32f9a1c768f56b0002),
  [`1274891d`](https://github.com/chakra-ui/zag/commit/1274891dc06ea869dd2db78685aab252b7baec91)]:
  - @zag-js/popper@0.1.3
  - @zag-js/dom-utils@0.1.2

## 0.1.4

### Patch Changes

- [#88](https://github.com/chakra-ui/zag/pull/88)
  [`f19a0f0b`](https://github.com/chakra-ui/zag/commit/f19a0f0b2917525f114d305a8e83196a2fc56003) Thanks
  [@xylophonehero](https://github.com/xylophonehero)! - Improve popper arrow rotation based on placement

* [#89](https://github.com/chakra-ui/zag/pull/89)
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add incremental support for shadow root in machines

* Updated dependencies [[`f19a0f0b`](https://github.com/chakra-ui/zag/commit/f19a0f0b2917525f114d305a8e83196a2fc56003),
  [`bcf247f1`](https://github.com/chakra-ui/zag/commit/bcf247f18afa5413a7b008f5ab5cbd3665350cb9),
  [`a71d5d2a`](https://github.com/chakra-ui/zag/commit/a71d5d2a984e4293ebeb55944e27df20492ad1c0)]:
  - @zag-js/popper@0.1.2
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
  - @zag-js/popper@0.1.1

## 0.1.2

### Patch Changes

- [#70](https://github.com/chakra-ui/zag/pull/70)
  [`29691a7`](https://github.com/chakra-ui/zag/commit/29691a7151047bf4a62474c2be64acfc18d827ce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Prefer `raf` over `nextTick` for focus management

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
  - @zag-js/aria-hidden@0.1.0
  - @zag-js/utils@0.1.0
  - @zag-js/dom-utils@0.1.0
  - @zag-js/popper@0.1.0
