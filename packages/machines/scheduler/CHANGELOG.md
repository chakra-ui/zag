# @zag-js/scheduler

## 2.0.0-next.4

### Patch Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`ae4d6d9`](https://github.com/chakra-ui/zag/commit/ae4d6d9ac5b68a7e7f77e3aa108c501e673b3498) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Add resource scheduling via `resources` and
  `groupBy: "resource"`, splitting each day column into per-resource lanes.
  - Add the `timeline` view — a horizontal, resource-per-row layout.
  - Add drag and drop constraints via `canDropEvent`, and external drag-and-drop via `dataTransferFormat` and
    `onEventReceive`. Items can be dropped on the all-day row as well as a timed slot, and `onEventReceive` reports
    which region took the drop.
  - Add `getAllDaySegments(days?)`, laying each all-day event out as one continuous bar across the days it covers rather
    than a separate chip per day, with resize handles only on its true ends. Pass a single week to lay out one row of a
    month grid.
  - Fixed issue where dragging or resizing an all-day event moved it through the time grid, collapsing it to a
    zero-length timed event. All-day gestures now move in whole days and keep their span.
  - Fixed issue where an event edge dragged past the opposite edge inverted the event.
  - Fixed issue where a multi-day all-day event disappeared when its last day was the first visible day.
  - Fixed issue where a timed event ending at midnight was listed on the following day too.
  - Fixed issue where recurring instances later than midnight on the last visible day were dropped.
  - Fixed issue where events on different resources were treated as conflicting.
  - Fixed issue where a long event title widened its all-day column, shifting every other column.
  - Fixed issue where all-day bars past the first level spilled out of the row into the time grid. The row now reports
    its level count so it can size itself, and `maxAllDayRows` caps it, collapsing the rest into per-day counts read
    from `getAllDayOverflow()`.
  - Dates in the scheduler API are now `CalendarDateTime` — the scheduler always works in wall-clock time, so a bare
    `CalendarDate` was never valid input.
- Updated dependencies [[`ae4d6d9`](https://github.com/chakra-ui/zag/commit/ae4d6d9ac5b68a7e7f77e3aa108c501e673b3498)]:
  - @zag-js/date-utils@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4
  - @zag-js/dom-query@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/date-utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17),
  [`734b5e8`](https://github.com/chakra-ui/zag/commit/734b5e8e43f03402f5c3d0c283a79d4615e4868b),
  [`e8b99d2`](https://github.com/chakra-ui/zag/commit/e8b99d2af940821a1ff34d086d5f0910c187ec4f),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2
  - @zag-js/core@2.0.0-next.2
  - @zag-js/types@2.0.0-next.2
  - @zag-js/utils@2.0.0-next.2
  - @zag-js/anatomy@2.0.0-next.2
  - @zag-js/date-utils@2.0.0-next.2

## 2.0.0-next.1

### Minor Changes

- [#3167](https://github.com/chakra-ui/zag/pull/3167)
  [`d2b9972`](https://github.com/chakra-ui/zag/commit/d2b9972052c5f131aacb1a8e5e4fd3f31ce15e07) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `get<Part>State()` getters (e.g. `getTriggerState`,
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
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/date-utils@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies [[`5820feb`](https://github.com/chakra-ui/zag/commit/5820febc81934f3d8d17e01f085aafe6dd81fc73)]:
  - @zag-js/anatomy@2.0.0-next.0
  - @zag-js/types@2.0.0-next.0
  - @zag-js/dom-query@2.0.0-next.0
  - @zag-js/core@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0
  - @zag-js/date-utils@2.0.0-next.0
