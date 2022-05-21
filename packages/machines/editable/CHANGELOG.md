# @zag-js/editable

## 0.1.6

### Patch Changes

- Updated dependencies [[`1274891d`](https://github.com/chakra-ui/zag/commit/1274891dc06ea869dd2db78685aab252b7baec91)]:
  - @zag-js/dom-utils@0.1.2

## 0.1.5

### Patch Changes

- [`5f1e56ee`](https://github.com/chakra-ui/zag/commit/5f1e56ee25fadb2839ed5db214aa349905527dcd) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for different placeholders in preview and edit mode.

  The `placeholder` can be a `string` or an object containing `edit` and `preview`.

  ```js
  const [state, send] = useMachine(
    editable.machine({
      placeholder: { edit: "Enter...", preview: "Add name..." },
    }),
  )
  ```

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
  [`46ef565`](https://github.com/chakra-ui/zag/commit/46ef5659a855a382af1e5b0e24d35d03466cfb22)]:
  - @zag-js/dom-utils@0.1.1
  - @zag-js/core@0.1.3

## 0.1.2

### Patch Changes

- [#70](https://github.com/chakra-ui/zag/pull/70)
  [`077f890`](https://github.com/chakra-ui/zag/commit/077f890e27b69728b3de676624fdc4ae62491e59) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactored to use requestAnimationFrame instead of nextTick

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
  - @zag-js/dom-utils@0.1.0
