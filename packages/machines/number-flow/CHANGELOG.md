# @zag-js/number-flow

## 2.0.0-next.4

### Minor Changes

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

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/i18n-utils@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3
  - @zag-js/i18n-utils@2.0.0-next.3

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252)
  [`b819c61`](https://github.com/chakra-ui/zag/commit/b819c61b43abf3f2b6671ceea229ee4e0b8d988c) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/number-flow`, a state machine for animating
  a value change by rolling each digit to its new value. Use it for prices, scores, and live metrics, where a number
  changing is worth noticing.

  Formatting goes through `Intl.NumberFormat`, so currency, percent, and non-Latin numeral systems work out of the box.
  Digits are keyed by decimal place, so `999` to `1000` adds one digit instead of re-keying the rest mid-roll.

  Unlike most machines, a digit is not one element. You render `api.digitCells` as a strip of `0-9` inside each digit,
  and the machine translates the strip so the right cell lands in view.

  Parts: `root`, `valueText`, `digit`, `digitTrack`, `digitCell`, `symbol`.

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
  - @zag-js/i18n-utils@2.0.0-next.2
  - @zag-js/anatomy@2.0.0-next.2
