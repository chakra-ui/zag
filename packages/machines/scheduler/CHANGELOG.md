# @zag-js/scheduler

## 2.0.0-next.4

### Minor Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`1e1f6da`](https://github.com/chakra-ui/zag/commit/1e1f6da67fb6fb4682a9982a9243eec8f06fb7ae) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - **Breaking:** "Prev" is now spelled out as "Previous"
  across the API.

  ### Parts

  The `prevTrigger` part is now `previousTrigger` in carousel, date picker, pagination, scheduler and steps. This
  renames its prop getter, data attribute, `ids` key and translation key.

  ```diff
  - <button {...api.getPrevTriggerProps()} />
  + <button {...api.getPreviousTriggerProps()} />
  ```

  ```diff
  - [data-carousel-prev-trigger] { ... }
  + [data-carousel-previous-trigger] { ... }
  ```

  ```diff
    carousel.machine({
  -   ids: { prevTrigger: "prev" },
  -   translations: { prevTrigger: "Previous slide" },
  +   ids: { previousTrigger: "prev" },
  +   translations: { previousTrigger: "Previous slide" },
    })
  ```

  Pagination and scheduler: `translations.prevTriggerLabel` is now `translations.previousTriggerLabel`.

  ### API

  | Component              | Before                          | After                                   |
  | ---------------------- | ------------------------------- | --------------------------------------- |
  | Carousel               | `scrollPrev()`, `canScrollPrev` | `scrollPrevious()`, `canScrollPrevious` |
  | Date picker, Scheduler | `goToPrev()`                    | `goToPrevious()`                        |
  | Pagination             | `goToPrevPage()`                | `goToPreviousPage()`                    |
  | Steps                  | `goToPrevStep()`, `hasPrevStep` | `goToPreviousStep()`, `hasPreviousStep` |
  | Tabs                   | `selectPrev()`                  | `selectPrevious()`                      |
  | Tour                   | `prev()`, `hasPrevStep`         | `previous()`, `hasPreviousStep`         |

  ### Tour step actions

  The `"prev"` action is now `"previous"`, along with the action map method and translation key. The action trigger
  renders `data-type="previous"`.

  ```diff
    actions: [
  -   { label: "Prev", action: "prev" },
  +   { label: "Previous", action: "previous" },
    ]

  - action: (actions) => actions.prev()
  + action: (actions) => actions.previous()

  - translations: { prevStep: "Previous step" }
  + translations: { previousStep: "Previous step" }
  ```

### Patch Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`12f18ab`](https://github.com/chakra-ui/zag/commit/12f18abeafe47ce181e45ea81552b8400681b1f8) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - ### Features

  Resource scheduling splits each day column into per-resource lanes, or one row per resource in the new `timeline`
  view.

  ```ts
  scheduler.machine({
    resources: [
      { id: "room-a", title: "Room A" },
      { id: "room-b", title: "Room B" },
    ],
    groupBy: "resource",
    events: [{ id: "1", resourceId: "room-a" /* ... */ }],
  })
  ```

  - Drop constraints via `canDropEvent`, and external drag and drop via `dataTransferFormat` and `onEventReceive`. Items
    can be dropped on the all-day row or a timed slot, and `onEventReceive` reports which one took the drop.
  - `getAllDaySegments(days?)` lays out each all-day event as one bar across the days it covers, with resize handles
    only on its true ends. Pass a single week to lay out one row of a month grid.
  - `maxAllDayRows` caps the all-day row, collapsing the rest into per-day counts from `getAllDayOverflow()`.
  - Dates in the scheduler API are now `CalendarDateTime`, since the scheduler always works in wall-clock time.

  ### Fixes
  - Dragging or resizing an all-day event now moves it in whole days and keeps its span, instead of collapsing it into a
    zero-length timed event.
  - Dragging an event edge past the opposite edge no longer inverts the event.
  - A multi-day all-day event no longer disappears when its last day is the first visible day.
  - A timed event ending at midnight is no longer listed on the following day too.
  - Recurring instances after midnight on the last visible day are no longer dropped.
  - Events on different resources are no longer treated as conflicting.
  - A long event title no longer widens its all-day column.
  - All-day bars past the first level no longer spill into the time grid.
  - **Date utils:** The alignment, pagination and week/month helpers now return the date type they were given, instead
    of widening it to `DateValue`.

- Updated dependencies [[`12f18ab`](https://github.com/chakra-ui/zag/commit/12f18abeafe47ce181e45ea81552b8400681b1f8)]:
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
