# @zag-js/gridlist

## 2.0.0-next.4

### Patch Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`730ea29`](https://github.com/chakra-ui/zag/commit/730ea29dd3fff5005687020bc73d9f75962e2b5c) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Cancel pending focus, scroll and sync frames when the
  machine stops, and let a newer request replace a pending one.

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`12f18ab`](https://github.com/chakra-ui/zag/commit/12f18abeafe47ce181e45ea81552b8400681b1f8) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Clicking a button or link inside a gridlist row, or
  inside a tree node (e.g. an actions menu trigger), no longer selects the row or node.
  - **Gridlist:** The gridlist can be reached with Tab again after losing focus, and tabbing in focuses the selected
    item, or the first item when nothing is selected.
- Updated dependencies [[`b0c2a7c`](https://github.com/chakra-ui/zag/commit/b0c2a7ce82f310bc236e2a553a81c153329bed0d),
  [`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633),
  [`c8ae9b4`](https://github.com/chakra-ui/zag/commit/c8ae9b4bc86bc2c0c3d8445fc2378df9cfb003f1),
  [`b0c2a7c`](https://github.com/chakra-ui/zag/commit/b0c2a7ce82f310bc236e2a553a81c153329bed0d),
  [`3527451`](https://github.com/chakra-ui/zag/commit/3527451f2717ac7ec851e1845ea94cdfc508cb2e),
  [`601907c`](https://github.com/chakra-ui/zag/commit/601907c870f000539220d5fbe287b1e4b55482f7),
  [`f984da6`](https://github.com/chakra-ui/zag/commit/f984da6fca728f76742c7f85fdd45e28e82d4fff)]:
  - @zag-js/collection@2.0.0-next.4
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/focus-visible@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`f832098`](https://github.com/chakra-ui/zag/commit/f8320988711fd54b13aef8f28c0d7038e92d3a11)]:
  - @zag-js/focus-visible@2.0.0-next.3
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/collection@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`82692cd`](https://github.com/chakra-ui/zag/commit/82692cd7307923c9648ece5ff4532b31108cf9f8),
  [`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17),
  [`734b5e8`](https://github.com/chakra-ui/zag/commit/734b5e8e43f03402f5c3d0c283a79d4615e4868b),
  [`e8b99d2`](https://github.com/chakra-ui/zag/commit/e8b99d2af940821a1ff34d086d5f0910c187ec4f),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2
  - @zag-js/focus-visible@2.0.0-next.2
  - @zag-js/core@2.0.0-next.2
  - @zag-js/types@2.0.0-next.2
  - @zag-js/utils@2.0.0-next.2
  - @zag-js/collection@2.0.0-next.2
  - @zag-js/anatomy@2.0.0-next.2

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

- Updated dependencies [[`1b6233d`](https://github.com/chakra-ui/zag/commit/1b6233d09bd8f0076f2b282bd8f5a58d8c65260b)]:
  - @zag-js/collection@2.0.0-next.1
  - @zag-js/anatomy@2.0.0-next.1
  - @zag-js/core@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1
  - @zag-js/focus-visible@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#3061](https://github.com/chakra-ui/zag/pull/3061)
  [`17cbe88`](https://github.com/chakra-ui/zag/commit/17cbe88be41ac0df0ebb4a62e1dd680c0700e729) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/gridlist` — a framework-agnostic state
  machine for the WAI-ARIA grid pattern. Use this for interactive lists whose items contain buttons, links, or other
  focusable content where listbox's `option` role isn't valid.

  Features:
  - Single/multiple selection with `toggle` or `replace` behavior
  - Full keyboard navigation: arrows, Home/End, Page Up/Down, typeahead, Ctrl/Cmd+A
  - Item activation via `onAction`
  - Linkable items via `href` + `onNavigate`
  - Checkbox helper for toggle selection
  - Grouping via `collection.group()`
  - Virtualization via `scrollToIndexFn`
  - 2D layouts via `GridCollection`

  Parts: `root`, `label`, `content`, `itemGroup`, `itemGroupLabel`, `item`, `cell`, `itemText`, `itemIndicator`,
  `checkbox`, `empty`.

### Patch Changes

- Updated dependencies [[`5820feb`](https://github.com/chakra-ui/zag/commit/5820febc81934f3d8d17e01f085aafe6dd81fc73)]:
  - @zag-js/anatomy@2.0.0-next.0
  - @zag-js/types@2.0.0-next.0
  - @zag-js/dom-query@2.0.0-next.0
  - @zag-js/core@2.0.0-next.0
  - @zag-js/focus-visible@2.0.0-next.0
  - @zag-js/collection@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0
