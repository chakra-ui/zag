# @zag-js/gridlist

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
