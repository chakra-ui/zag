# @zag-js/number-flow

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.5
  - @zag-js/core@2.0.0-next.5
  - @zag-js/types@2.0.0-next.5
  - @zag-js/utils@2.0.0-next.5
  - @zag-js/dom-query@2.0.0-next.5
  - @zag-js/i18n-utils@2.0.0-next.5

## 2.0.0-next.4

### Minor Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`d6089c3`](https://github.com/chakra-ui/zag/commit/d6089c3f31a0952f7f35a0b8c08427770b43aac9) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Grow or shrink digits and symbols in place while they
  fade in or out (e.g. `999` to `1,000`), and roll new digits in by one step.

  - Apply `transformTiming` to enter and exit transitions. It had no effect before.

  - Default rolls and transitions to a spring-like easing over `900ms`.

  - Add `data-entering` and `data-exiting` to digits and symbols while they animate.

  - Fix digits going blank during rapid updates.

  - Fix reordering `formatOptions` keys restarting the format update.

### Patch Changes

- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633)]:
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/i18n-utils@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4

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
