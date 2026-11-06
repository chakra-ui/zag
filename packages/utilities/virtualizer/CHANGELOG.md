# @zag-js/virtualizer

## 2.0.0-next.4

### Patch Changes

- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633),
  [`c8ae9b4`](https://github.com/chakra-ui/zag/commit/c8ae9b4bc86bc2c0c3d8445fc2378df9cfb003f1),
  [`601907c`](https://github.com/chakra-ui/zag/commit/601907c870f000539220d5fbe287b1e4b55482f7),
  [`f984da6`](https://github.com/chakra-ui/zag/commit/f984da6fca728f76742c7f85fdd45e28e82d4fff)]:
  - @zag-js/dom-query@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- [#3308](https://github.com/chakra-ui/zag/pull/3308)
  [`2233444`](https://github.com/chakra-ui/zag/commit/22334447b60d1640c004f088a828e9de39d48de2) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Fixed issue where a grid virtualizer reused after
  `destroy()` reported a total size of zero, leaving the scroller with nothing to scroll (React Strict Mode remount).
  `init()` now rebuilds the size trackers `destroy()` released, and notifies subscribers so they re-render with the
  restored size.

- [#3308](https://github.com/chakra-ui/zag/pull/3308)
  [`aa2b456`](https://github.com/chakra-ui/zag/commit/aa2b45686df65373557eabbfac967ae1e7ac090f) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Fixed issues with the generated style helpers.

  - Fixed issue where `getContentStyle()` and related helpers returned unitless numbers that browsers ignore as CSS.
  - Fixed issue where the content element shrank inside a flex scroller. `getContentStyle()` now sets `flex-shrink: 0`.

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- [`8b3f4e5`](https://github.com/chakra-ui/zag/commit/8b3f4e5e03adcad5ff5e37e573d2e00822f340c7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fixed issue where `init()` after `destroy()` left the instance
  inert (React Strict Mode remount). Scroll and store updates are ignored while `isDestroyed` is true, and `init()` did
  not clear that flag.
- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.0
