# @zag-js/toolbar

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
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

- [#3167](https://github.com/chakra-ui/zag/pull/3167)
  [`d9084a6`](https://github.com/chakra-ui/zag/commit/d9084a60ff94f56390cc49cdee8239c8fe8c3f06) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - **Breaking:** Removed `data-focus` from toggle group and
  toolbar parts. Use native CSS selectors like `:focus-visible` to style the focused item and `:focus-within` to style
  the root while focus is inside.

  ### Migration

  ```diff
  - [data-toggle-group-root][data-focus] { ... }
  + [data-toggle-group-root]:focus-within { ... }

  - [data-toggle-group-item][data-focus] { ... }
  + [data-toggle-group-item]:focus-visible { ... }

  - [data-toolbar-root][data-focus] { ... }
  + [data-toolbar-root]:focus-within { ... }

  - [data-toolbar-item][data-focus] { ... }
  + [data-toolbar-item]:focus-visible { ... }
  ```

  **Breaking:** Updated toggle group to use toggle-button semantics in all selection modes. The root now renders
  `role="group"`, items expose `aria-pressed`, and single-select mode no longer renders radio roles or `aria-checked`.

  ### Migration

  If you query toggle group items by radio semantics, update those checks to use button semantics.

  ```diff
  - screen.getByRole("radiogroup")
  + screen.getByRole("group")

  - screen.getByRole("radio", { checked: true })
  + screen.getByRole("button", { pressed: true })
  ```

  If you style or query checked state, use `aria-pressed` instead of `aria-checked`.

  ```diff
  - [data-toggle-group-item][aria-checked="true"] { ... }
  + [data-toggle-group-item][aria-pressed="true"] { ... }
  ```

  **Breaking:** Removed `data-state="on|off"` from toggle and toggle group pressed parts. Use `data-pressed` to style
  pressed toggles.

  ### Migration

  ```diff
  - [data-toggle-root][data-state="on"] { ... }
  + [data-toggle-root][data-pressed] { ... }

  - [data-toggle-indicator][data-state="on"] { ... }
  + [data-toggle-indicator][data-pressed] { ... }

  - [data-toggle-group-item][data-state="on"] { ... }
  + [data-toggle-group-item][data-pressed] { ... }
  ```

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.1
  - @zag-js/core@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1
