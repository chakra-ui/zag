# @zag-js/gridlist

## 2.0.0-next.1

### Minor Changes

- [`d2b9972`](https://github.com/chakra-ui/zag/commit/d2b9972052c5f131aacb1a8e5e4fd3f31ce15e07) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `get<Part>State()` getters (e.g. `getTriggerState`,
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
