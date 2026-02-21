# @zag-js/image-cropper

## 1.35.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.35.0
  - @zag-js/core@1.35.0
  - @zag-js/types@1.35.0
  - @zag-js/utils@1.35.0
  - @zag-js/dom-query@1.35.0

## 1.34.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.34.1
  - @zag-js/core@1.34.1
  - @zag-js/types@1.34.1
  - @zag-js/utils@1.34.1
  - @zag-js/dom-query@1.34.1

## 1.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.34.0
  - @zag-js/core@1.34.0
  - @zag-js/types@1.34.0
  - @zag-js/utils@1.34.0
  - @zag-js/dom-query@1.34.0

## 1.33.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.33.1
  - @zag-js/core@1.33.1
  - @zag-js/types@1.33.1
  - @zag-js/utils@1.33.1
  - @zag-js/dom-query@1.33.1

## 1.33.0

### Patch Changes

- [`50c1c01`](https://github.com/chakra-ui/zag/commit/50c1c013a645d3d1315ca03ae39de29607a6cfd2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where `reset()` destroys the cropper area
  - Fix issue where changing `aspectRatio` or `cropShape` props doesn't update the crop instantly
  - Add symmetric resize support when holding `Alt` key during pointer drag
  - Fix panning bounds in fixed crop mode at various zoom levels
  - Fix race condition where initial crop may not compute on page reload
- Updated dependencies []:
  - @zag-js/anatomy@1.33.0
  - @zag-js/core@1.33.0
  - @zag-js/types@1.33.0
  - @zag-js/utils@1.33.0
  - @zag-js/dom-query@1.33.0

## 1.32.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.32.0
  - @zag-js/core@1.32.0
  - @zag-js/types@1.32.0
  - @zag-js/utils@1.32.0
  - @zag-js/dom-query@1.32.0

## 1.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.31.1
  - @zag-js/core@1.31.1
  - @zag-js/types@1.31.1
  - @zag-js/utils@1.31.1
  - @zag-js/dom-query@1.31.1

## 1.31.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.31.0
  - @zag-js/core@1.31.0
  - @zag-js/types@1.31.0
  - @zag-js/utils@1.31.0
  - @zag-js/dom-query@1.31.0

## 1.30.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.30.0
  - @zag-js/core@1.30.0
  - @zag-js/types@1.30.0
  - @zag-js/utils@1.30.0
  - @zag-js/dom-query@1.30.0

## 1.29.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.29.1
  - @zag-js/core@1.29.1
  - @zag-js/types@1.29.1
  - @zag-js/utils@1.29.1
  - @zag-js/dom-query@1.29.1

## 1.29.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.29.0
  - @zag-js/core@1.29.0
  - @zag-js/types@1.29.0
  - @zag-js/utils@1.29.0
  - @zag-js/dom-query@1.29.0

## 1.28.0

### Patch Changes

- [#2824](https://github.com/chakra-ui/zag/pull/2824)
  [`62cc85d`](https://github.com/chakra-ui/zag/commit/62cc85da2e7a0f75b669302904298d428f242b24) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Fix issues with the controlled `zoom` prop not functioning as
  expected

- [#2828](https://github.com/chakra-ui/zag/pull/2828)
  [`daebdc7`](https://github.com/chakra-ui/zag/commit/daebdc7c831be66fffd6f399406ed2ddde2796ee) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Clamping offset for non-fixed crop area should be based on
  viewport rectangle

- [`c656df8`](https://github.com/chakra-ui/zag/commit/c656df8846733f7b6241d152d76b515a95d6841a) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor to use shared `ResizeObserver` implementation across all
  machines. This significantly improves performance by using a single observer instance with `WeakMap` based
  subscriptions instead of creating separate observers for each component instance.

- [#2827](https://github.com/chakra-ui/zag/pull/2827)
  [`c1588af`](https://github.com/chakra-ui/zag/commit/c1588af21e173b9f95ed03c391ac7c114a4c1cc7) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Use `zoom` or `defaultZoom` as default value

- Updated dependencies [[`c59e4f5`](https://github.com/chakra-ui/zag/commit/c59e4f5b9bc43de85649d4de95e8bf270c16acab),
  [`c656df8`](https://github.com/chakra-ui/zag/commit/c656df8846733f7b6241d152d76b515a95d6841a)]:
  - @zag-js/dom-query@1.28.0
  - @zag-js/core@1.28.0
  - @zag-js/anatomy@1.28.0
  - @zag-js/types@1.28.0
  - @zag-js/utils@1.28.0

## 1.27.1

### Patch Changes

- [#2822](https://github.com/chakra-ui/zag/pull/2822)
  [`a372b95`](https://github.com/chakra-ui/zag/commit/a372b955911f78632665c7df86365414f64ac1f0) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Export missing types

- [#2819](https://github.com/chakra-ui/zag/pull/2819)
  [`56c1ead`](https://github.com/chakra-ui/zag/commit/56c1ead01c7d655ad84f4a079f36a98b69db294e) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Export missing types in image cropper

- Updated dependencies []:
  - @zag-js/anatomy@1.27.1
  - @zag-js/core@1.27.1
  - @zag-js/types@1.27.1
  - @zag-js/utils@1.27.1
  - @zag-js/dom-query@1.27.1

## 1.27.0

### Patch Changes

- Updated dependencies [[`cf6fb09`](https://github.com/chakra-ui/zag/commit/cf6fb0956aeacc236531ee90de9169a39cdde3a5),
  [`920e727`](https://github.com/chakra-ui/zag/commit/920e727f73940aed3c6d2b886c64200a4a5702d0)]:
  - @zag-js/dom-query@1.27.0
  - @zag-js/utils@1.27.0
  - @zag-js/core@1.27.0
  - @zag-js/anatomy@1.27.0
  - @zag-js/types@1.27.0

## 1.26.5

### Patch Changes

- [#2799](https://github.com/chakra-ui/zag/pull/2799)
  [`4b44542`](https://github.com/chakra-ui/zag/commit/4b44542907df703e40f4a25a2c17c798e58fb171) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Fix not working resize API

- [#2800](https://github.com/chakra-ui/zag/pull/2800)
  [`0f6e804`](https://github.com/chakra-ui/zag/commit/0f6e8048156f4383ed33ddbc5e024843ff62b6d2) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Export missing types

- [#2805](https://github.com/chakra-ui/zag/pull/2805)
  [`a766d97`](https://github.com/chakra-ui/zag/commit/a766d97ddc42a652a063e35b8fbcda4745513ff0) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Make the image cropper responsive

- Updated dependencies []:
  - @zag-js/anatomy@1.26.5
  - @zag-js/core@1.26.5
  - @zag-js/types@1.26.5
  - @zag-js/utils@1.26.5
  - @zag-js/dom-query@1.26.5

## 1.26.4

### Patch Changes

- [#2738](https://github.com/chakra-ui/zag/pull/2738)
  [`01bb3e1`](https://github.com/chakra-ui/zag/commit/01bb3e10d8383f2e294ba6a0dc6c09ec47517bfa) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Initial release of image cropper state machine

- Updated dependencies []:
  - @zag-js/anatomy@1.26.4
  - @zag-js/core@1.26.4
  - @zag-js/types@1.26.4
  - @zag-js/utils@1.26.4
  - @zag-js/dom-query@1.26.4
