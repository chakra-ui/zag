# @zag-js/safe-area

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252) [`d402e9c`](https://github.com/chakra-ui/zag/commit/d402e9c6fee7e159b0a5fae1e228c9b31572db22) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/safe-area` and use it in the hover card to track the pointer travelling between the trigger and the
  content.

  - Fixed issue where the hover card closed while the pointer was still on its way to the content. Moving diagonally, or
    pausing for longer than `closeDelay`, no longer dismisses it.
  - Fixed issue where a hover card opened programmatically or by keyboard was dismissed by pointer movement anywhere on
    the page.

  The `open` and `closing` states are now `open.idle` and `open.closing`. `state.matches("open")` still works, but code
  matching the literal state `"closing"` should use `"open.closing"`.

  The tooltip uses it too when `interactive` is set, so the pointer can reach a hoverable tooltip without it closing on
  the way (WCAG 1.4.13). Non-interactive tooltips are unchanged.

### Patch Changes

- Updated dependencies [[`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05)]:
  - @zag-js/dom-query@2.0.0-next.2
