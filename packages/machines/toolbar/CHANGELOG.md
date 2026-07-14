# @zag-js/toolbar

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
