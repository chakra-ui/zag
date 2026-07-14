# @zag-js/dnd

## 2.0.0-next.1

### Minor Changes

- [`d2b9972`](https://github.com/chakra-ui/zag/commit/d2b9972052c5f131aacb1a8e5e4fd3f31ce15e07) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `get<Part>State()` getters (e.g. `getTriggerState`,
  `getContentState`, `getRootState`), extending the existing `getItemState` convention to every part with derived state.

  ```ts
  const triggerState = dialog.getTriggerState({ value: "confirm" })
  // { value: "confirm", current: true, open: true }
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.1
  - @zag-js/core@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/aria-hidden@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1
  - @zag-js/live-region@2.0.0-next.1
  - @zag-js/rect-utils@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies [[`5820feb`](https://github.com/chakra-ui/zag/commit/5820febc81934f3d8d17e01f085aafe6dd81fc73),
  [`2d8aae2`](https://github.com/chakra-ui/zag/commit/2d8aae2f1588b5fdcfb6d7037b1d5f9994222dd7)]:
  - @zag-js/anatomy@2.0.0-next.0
  - @zag-js/types@2.0.0-next.0
  - @zag-js/rect-utils@2.0.0-next.0
  - @zag-js/dom-query@2.0.0-next.0
  - @zag-js/core@2.0.0-next.0
  - @zag-js/aria-hidden@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0
  - @zag-js/live-region@2.0.0-next.0
