# @zag-js/safe-area

## 2.0.0-next.4

### Patch Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`3527451`](https://github.com/chakra-ui/zag/commit/3527451f2717ac7ec851e1845ea94cdfc508cb2e) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - **Hover Card**
  - Fix a card opened without hovering its trigger, such as with `defaultOpen`, closing when the pointer passes over it.
  - Fix a card or menu opened from inside the card closing it. Opening a menu from the card now keeps it open until
    dismissed.
  - Fix `onOpenChange` reporting a close twice when a controlled card is dismissed during a pending hover close.
  - Fix the card reopening when the window regains focus.
  - Fix the card staying open when its trigger is removed.
  - Add `data-instant` to the content when focus opens the card or Escape closes it, so the animation can be skipped.
  - **Tooltip**: Fix a closed tooltip reopening when the window regains focus.
  - **Focus Visible**: Add `isFocusRestoredByWindow`.
  - **Safe Area**: Add the `isTargetInside` option.
  - **Dismissable**: Add `isInNestedLayer`.
- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633),
  [`c8ae9b4`](https://github.com/chakra-ui/zag/commit/c8ae9b4bc86bc2c0c3d8445fc2378df9cfb003f1),
  [`601907c`](https://github.com/chakra-ui/zag/commit/601907c870f000539220d5fbe287b1e4b55482f7),
  [`f984da6`](https://github.com/chakra-ui/zag/commit/f984da6fca728f76742c7f85fdd45e28e82d4fff)]:
  - @zag-js/dom-query@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252)
  [`d402e9c`](https://github.com/chakra-ui/zag/commit/d402e9c6fee7e159b0a5fae1e228c9b31572db22) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/safe-area` and use it in the hover card to
  track the pointer travelling between the trigger and the content.

  - Fixed issue where the hover card closed while the pointer was still on its way to the content. Moving diagonally, or
    pausing for longer than `closeDelay`, no longer dismisses it.
  - Fixed issue where a hover card opened programmatically or by keyboard was dismissed by pointer movement anywhere on
    the page.

  The `open` and `closing` states are now `open.idle` and `open.closing`. `state.matches("open")` still works, but code
  matching the literal state `"closing"` should use `"open.closing"`.

  The tooltip uses it too when `interactive` is set, so the pointer can reach a hoverable tooltip without it closing on
  the way (WCAG 1.4.13). Non-interactive tooltips are unchanged.

### Patch Changes

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2
