# @zag-js/infinite-scroll

## 2.0.0-next.4

### Patch Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`12f18ab`](https://github.com/chakra-ui/zag/commit/12f18abeafe47ce181e45ea81552b8400681b1f8) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - **Number flow:** Smoother transitions when the number
  gains or loses digits.

  - Digits and symbols that enter or exit (e.g. `999` to `1,000`) now grow or shrink in place while fading, instead of
    popping in and out. New digits also roll in by one step.
  - `transformTiming` now controls these enter and exit transitions. Previously it had no effect.
  - The default timing for rolls and transitions is now a spring-like easing over `900ms`.
  - Digits and symbols expose `data-entering` and `data-exiting` while they animate in or out.
  - Reordering `formatOptions` keys no longer restarts the format update.

  **Slider:** Allow `thumbSize` to be a single number that sets both the thumb width and height, e.g. `thumbSize: 20`.

  **Infinite scroll:** Loading more now keeps working after the list is replaced (e.g. by a new search), and when the
  sentinel renders after the machine starts observing.

  **Tabs:** `onValueChange` and `onFocusChange` details are now typed as nullable. `value` is `null` after a
  `deselectable` tab is deselected, and `focusedValue` is `null` when focus leaves the tab list.

  **Toggle:** The machine now accepts the common `id` and `getRootNode` props, and `splitProps` keeps them.

  **Anatomy icons:** Add missing anatomy diagrams for angle slider, cascade select, collapsible, drawer, image cropper,
  listbox, marquee, navigation menu, and timer.

- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633),
  [`c8ae9b4`](https://github.com/chakra-ui/zag/commit/c8ae9b4bc86bc2c0c3d8445fc2378df9cfb003f1),
  [`601907c`](https://github.com/chakra-ui/zag/commit/601907c870f000539220d5fbe287b1e4b55482f7),
  [`f984da6`](https://github.com/chakra-ui/zag/commit/f984da6fca728f76742c7f85fdd45e28e82d4fff)]:
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4
  - @zag-js/live-region@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`76af82f`](https://github.com/chakra-ui/zag/commit/76af82f18e4897c7efd20ed298e0203b36b09932)]:
  - @zag-js/live-region@2.0.0-next.3
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252)
  [`26a4df0`](https://github.com/chakra-ui/zag/commit/26a4df030c6239aa272f65123bdf9ffdc23eadf3) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/infinite-scroll`, a machine for loading
  paginated content as the user scrolls. Supports both scroll edges (`end` for feeds, `start` for chat threads with
  scroll anchoring), horizontal and RTL layouts, controlled and promise-derived loading, and screen reader announcements
  for loaded and completed states.

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
  - @zag-js/live-region@2.0.0-next.2
