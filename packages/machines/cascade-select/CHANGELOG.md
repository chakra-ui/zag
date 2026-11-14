# @zag-js/cascade-select

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.5
  - @zag-js/core@2.0.0-next.5
  - @zag-js/types@2.0.0-next.5
  - @zag-js/collection@2.0.0-next.5
  - @zag-js/utils@2.0.0-next.5
  - @zag-js/dismissable@2.0.0-next.5
  - @zag-js/dom-query@2.0.0-next.5
  - @zag-js/focus-visible@2.0.0-next.5
  - @zag-js/popper@2.0.0-next.5
  - @zag-js/rect-utils@2.0.0-next.5

## 2.0.0-next.4

### Major Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`08ea850`](https://github.com/chakra-ui/zag/commit/08ea8502ec357db6f528c71e9f2124dcdb96ca06) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Zag no longer sets a `z-index` on overlays. Set it in
  CSS, using `--layer-index` for the overlay's place in the stack.

  - Fix a `z-index` set on the positioner in CSS being overridden.

  - Fix overlays dropping behind other layers while they animate out. `--layer-index` stays set after close.

  **Breaking:** Move the `z-index` to the positioner (or the backdrop) and add `--layer-index`.

  ```diff
  - [data-popover-content] {
  + [data-popover-positioner] {
  -   z-index: 1400;
  +   z-index: calc(1400 + var(--layer-index));
    }
  ```

  - Popover, menu, select, combobox, hover card, tooltip, date picker, color picker and cascade select no longer copy
    the content's `z-index` onto the positioner or set `--z-index`.

  - Dialog and drawer no longer set `--z-index`. Use `--layer-index` on the backdrop and positioner.

  - The floating panel no longer sets a `z-index`. Style the positioner as above to bring the focused panel to the
    front.

  - The tour no longer copies the content's `z-index` onto dialog steps. Style the positioner with `--tour-layer`.

  - The toast group no longer sets an inline `z-index`. Set it on `[data-toast-group]` in CSS.

  - Remove the `zIndex` and `zIndexFallback` options from `getDismissableLayerStyle`.

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`12f18ab`](https://github.com/chakra-ui/zag/commit/12f18abeafe47ce181e45ea81552b8400681b1f8) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Add a filter input and an empty state to menu and
  select with `popupType: "dialog"`. You filter the items; the input keeps focus while the arrow keys move the
  highlight.

  ```tsx
  <div {...api.getContentProps()}>
    <input {...api.getInputProps()} />
    <div {...api.getEmptyProps()}>{items.length === 0 && "No results"}</div>
    <div {...api.getListProps()}>{/* items */}</div>
  </div>
  ```

  - Add `getEmptyProps()` to combobox and listbox. It's a polite live region, so keep it rendered and toggle its text.

  - Fix a lazily mounted popup inside nested dialogs rendering behind the dialog.

  **Breaking:** Set the highlight with `setHighlightedValue` in every list component, and pass `null` to clear it.

  ```diff
  - api.setHighlightValue("react") // select, combobox, cascade select
  - api.highlightValue("react") // listbox
  + api.setHighlightedValue("react")

  - api.clearHighlightValue()
  + api.setHighlightedValue(null)
  ```

  **Breaking (menu):** Replace `composite` with `popupType`, matching select and combobox.

  ```diff
  - menu.machine({ composite: false })
  + menu.machine({ popupType: "dialog" })
  ```

  - **Menu:** Add `autoHighlight` to highlight the first item as the query changes. A submenu can have its own input;
    `Escape`, `Shift+Tab` or `ArrowLeft` on an empty input returns to the parent's. `onHighlightChange` reports a
    `reason`.

  - **Select:** `Home` and `End` jump to the first or last item when the input is empty, and `alignItemWithTrigger`
    keeps the selected item of a long list next to the trigger.

### Minor Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`4f28f36`](https://github.com/chakra-ui/zag/commit/4f28f36c533f12c4a9b5ec0eaad7a77dc8c5faf2) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Add `reason` to `onOpenChange` details, such as
  `trigger-click`, `escape-key`, `interact-outside`, `item-select` or `script`. Each component exports its
  `OpenChangeReason` type.

  - Add an optional `reason` to `api.setOpen(open, reason)`, defaulting to `script`.

### Patch Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`730ea29`](https://github.com/chakra-ui/zag/commit/730ea29dd3fff5005687020bc73d9f75962e2b5c) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Fix focus, scroll and sync work scheduled for the next
  frame running after the component unmounts.

- [#3634](https://github.com/chakra-ui/zag/pull/3634)
  [`772248d`](https://github.com/chakra-ui/zag/commit/772248d81bf403274b1106389011a77634ee4143) Thanks
  [@anubra266](https://github.com/anubra266)! - Fix the selected and highlighted state getting out of sync with `value`
  and `highlightedValue`.

  - The trigger now shows `valueAsString` for a `defaultValue`, a controlled `value`, and a controlled `value` changed
    from outside.
  - When a controlled `value` rejects a selection, the trigger keeps showing the controlled value instead of the
    rejected one.
  - A controlled `highlightedValue` now opens the matching nested lists.
  - Opening the menu now scrolls every list to its part of the highlighted path, not only the last list.

- Updated dependencies [[`d6089c3`](https://github.com/chakra-ui/zag/commit/d6089c3f31a0952f7f35a0b8c08427770b43aac9),
  [`a87b07c`](https://github.com/chakra-ui/zag/commit/a87b07cd7b52ffd9083cd61ea1f135b927e98109),
  [`cb8e73d`](https://github.com/chakra-ui/zag/commit/cb8e73dce228eb9eafb768e3e744fe35e9dac7f9),
  [`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633),
  [`4f28f36`](https://github.com/chakra-ui/zag/commit/4f28f36c533f12c4a9b5ec0eaad7a77dc8c5faf2),
  [`08ea850`](https://github.com/chakra-ui/zag/commit/08ea8502ec357db6f528c71e9f2124dcdb96ca06)]:
  - @zag-js/collection@2.0.0-next.4
  - @zag-js/dismissable@2.0.0-next.4
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/popper@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/focus-visible@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4
  - @zag-js/rect-utils@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`f832098`](https://github.com/chakra-ui/zag/commit/f8320988711fd54b13aef8f28c0d7038e92d3a11),
  [`f2f2900`](https://github.com/chakra-ui/zag/commit/f2f290078da5058947f020f17311a475abf6cbd5),
  [`5a6c68f`](https://github.com/chakra-ui/zag/commit/5a6c68f390c2535b9da0423597e32e1a5a9eb1de)]:
  - @zag-js/focus-visible@2.0.0-next.3
  - @zag-js/dismissable@2.0.0-next.3
  - @zag-js/popper@2.0.0-next.3
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/collection@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3
  - @zag-js/rect-utils@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`021c599`](https://github.com/chakra-ui/zag/commit/021c599ef5011efc97f2e4bacc55c0a05791d5bf),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`82692cd`](https://github.com/chakra-ui/zag/commit/82692cd7307923c9648ece5ff4532b31108cf9f8),
  [`afdeee4`](https://github.com/chakra-ui/zag/commit/afdeee4f44e8ffc8e05cb4a4e76a770e303086f7),
  [`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17),
  [`734b5e8`](https://github.com/chakra-ui/zag/commit/734b5e8e43f03402f5c3d0c283a79d4615e4868b),
  [`e8b99d2`](https://github.com/chakra-ui/zag/commit/e8b99d2af940821a1ff34d086d5f0910c187ec4f),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2
  - @zag-js/dismissable@2.0.0-next.2
  - @zag-js/focus-visible@2.0.0-next.2
  - @zag-js/popper@2.0.0-next.2
  - @zag-js/core@2.0.0-next.2
  - @zag-js/types@2.0.0-next.2
  - @zag-js/utils@2.0.0-next.2
  - @zag-js/collection@2.0.0-next.2
  - @zag-js/anatomy@2.0.0-next.2
  - @zag-js/rect-utils@2.0.0-next.2

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
  [`037af89`](https://github.com/chakra-ui/zag/commit/037af89695fa2459fe496c419cbf56ed56510d78) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Move layer stack styles and attributes into machine
  connect props so framework renders cannot overwrite them.

  **Breaking:** `trackDismissableElement` now requires `onLayerChange`. Apply the emitted snapshot's layer index,
  nesting metadata, and pointer blocking state to the registered element through your framework's render output.

- [#3167](https://github.com/chakra-ui/zag/pull/3167)
  [`8148d4d`](https://github.com/chakra-ui/zag/commit/8148d4dc44c1d3638869c2fdcf4d9e5fba14decd) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Fix positioner appearing in the top-left corner on first
  open (most visible in the Svelte adapter). The positioner now stays hidden off-screen via a CSS variable fallback in
  `transform` instead of a `positioned`-gated `opacity`. This keeps the framework-managed style static, so reactive
  re-renders no longer clobber the `--x`/`--y` variables popper sets.

  As a result, the internal `positioned` context flag is removed from positioned machines (popover, menu, select, etc.).

  Also fixes `cascade-select` positioning: it now sets the initial placement before measuring and defers the first
  placement computation (matching the other components), so it positions correctly on open — including `defaultOpen`.

- Updated dependencies [[`1b6233d`](https://github.com/chakra-ui/zag/commit/1b6233d09bd8f0076f2b282bd8f5a58d8c65260b),
  [`037af89`](https://github.com/chakra-ui/zag/commit/037af89695fa2459fe496c419cbf56ed56510d78),
  [`8148d4d`](https://github.com/chakra-ui/zag/commit/8148d4dc44c1d3638869c2fdcf4d9e5fba14decd)]:
  - @zag-js/collection@2.0.0-next.1
  - @zag-js/dismissable@2.0.0-next.1
  - @zag-js/popper@2.0.0-next.1
  - @zag-js/anatomy@2.0.0-next.1
  - @zag-js/core@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1
  - @zag-js/focus-visible@2.0.0-next.1
  - @zag-js/rect-utils@2.0.0-next.1

## 2.0.0-next.0

## 1.48.0

### Patch Changes

- [#3574](https://github.com/chakra-ui/zag/pull/3574)
  [`05ec7e2`](https://github.com/chakra-ui/zag/commit/05ec7e2329ccfcf4583c96e6daec05e79b37371b) Thanks
  [@lord-0011](https://github.com/lord-0011)! - - Fix the page scrolling when the highlighted item is scrolled into
  view.
- Updated dependencies [[`fbd42d3`](https://github.com/chakra-ui/zag/commit/fbd42d37fd2d0b6f8fe5031451e1dc02615b93eb),
  [`fbd42d3`](https://github.com/chakra-ui/zag/commit/fbd42d37fd2d0b6f8fe5031451e1dc02615b93eb),
  [`3a7857a`](https://github.com/chakra-ui/zag/commit/3a7857a9581187f84708594ceb1d75769b2cc20e),
  [`10b5bad`](https://github.com/chakra-ui/zag/commit/10b5bad00ee09c1cdc93dd9c1a7633eb88082690)]:
  - @zag-js/dismissable@1.48.0
  - @zag-js/dom-query@1.48.0
  - @zag-js/collection@1.48.0
  - @zag-js/utils@1.48.0
  - @zag-js/core@1.48.0
  - @zag-js/focus-visible@1.48.0
  - @zag-js/popper@1.48.0
  - @zag-js/anatomy@1.48.0
  - @zag-js/types@1.48.0
  - @zag-js/rect-utils@1.48.0

## 1.47.0

### Patch Changes

- [#3531](https://github.com/chakra-ui/zag/pull/3531)
  [`cfdcfb7`](https://github.com/chakra-ui/zag/commit/cfdcfb7a1fc03b7de458f2282532948903455f35) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix the content taking focus after closing right after it
  opened.
  - Fix leaving an item clearing the next item's grace area early, which could switch the highlighted item.
  - Fix a pending scroll to the highlighted item running after the content closes.
  - Fix the trigger missing its focus ring in Firefox after closing with Escape.
  - Fix Escape not closing the content right after it opens.
- Updated dependencies [[`d597306`](https://github.com/chakra-ui/zag/commit/d5973062d830ea2128c27f5eb1807f5807e076e8),
  [`94fbd51`](https://github.com/chakra-ui/zag/commit/94fbd51c20586f78c5df2db4811bb252ba099bf1),
  [`81992a5`](https://github.com/chakra-ui/zag/commit/81992a56b8600c0b2403e486059a41d66bad4ea4),
  [`b8c35b6`](https://github.com/chakra-ui/zag/commit/b8c35b69b03bf094fe99fe2df67abbaa72dabcbb)]:
  - @zag-js/dismissable@1.47.0
  - @zag-js/dom-query@1.47.0
  - @zag-js/focus-visible@1.47.0
  - @zag-js/popper@1.47.0
  - @zag-js/core@1.47.0
  - @zag-js/anatomy@1.47.0
  - @zag-js/types@1.47.0
  - @zag-js/collection@1.47.0
  - @zag-js/utils@1.47.0
  - @zag-js/rect-utils@1.47.0

## 1.46.0

### Patch Changes

- [#3426](https://github.com/chakra-ui/zag/pull/3426)
  [`656f677`](https://github.com/chakra-ui/zag/commit/656f6770c719f447427f583ca924f954a6e47d93) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix nested popups rendering behind their parent layer when using
  `--layer-index` with `lazyMount` or `unmountOnExit`. Keep the positioner's z-index synchronized with its dismissable
  layer and preserve it during exit animations.
- Updated dependencies [[`0afddfa`](https://github.com/chakra-ui/zag/commit/0afddfae6e4f9fea790d4321bf2d0bb37160f4a1),
  [`656f677`](https://github.com/chakra-ui/zag/commit/656f6770c719f447427f583ca924f954a6e47d93)]:
  - @zag-js/focus-visible@1.46.0
  - @zag-js/dismissable@1.46.0
  - @zag-js/anatomy@1.46.0
  - @zag-js/core@1.46.0
  - @zag-js/types@1.46.0
  - @zag-js/collection@1.46.0
  - @zag-js/utils@1.46.0
  - @zag-js/dom-query@1.46.0
  - @zag-js/popper@1.46.0
  - @zag-js/rect-utils@1.46.0

## 1.45.0

### Patch Changes

- Updated dependencies [[`8a204a3`](https://github.com/chakra-ui/zag/commit/8a204a33f1e7074ea5aab394bd4682745e7125ed),
  [`cfb5874`](https://github.com/chakra-ui/zag/commit/cfb5874ed6b1b3128f308ba47aa445d13fe5c631),
  [`a125167`](https://github.com/chakra-ui/zag/commit/a1251671fcee3e2d3f61ec7cb661dff7cc8ba51c),
  [`9a21994`](https://github.com/chakra-ui/zag/commit/9a21994abaa44bfec4e3afbe942da6bf6eddba68),
  [`647e225`](https://github.com/chakra-ui/zag/commit/647e225e087f3646a1dffdb02594ca6a11548641),
  [`6688282`](https://github.com/chakra-ui/zag/commit/668828229eb47730be2a9da78956ff3fd01317fb)]:
  - @zag-js/focus-visible@1.45.0
  - @zag-js/dom-query@1.45.0
  - @zag-js/utils@1.45.0
  - @zag-js/collection@1.45.0
  - @zag-js/core@1.45.0
  - @zag-js/popper@1.45.0
  - @zag-js/dismissable@1.45.0
  - @zag-js/anatomy@1.45.0
  - @zag-js/types@1.45.0
  - @zag-js/rect-utils@1.45.0

## 1.44.0

### Patch Changes

- [`06be915`](https://github.com/chakra-ui/zag/commit/06be9152837570cfed4037985fb285e30ffef2c5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix `api.setOpen` ignoring a second call made in the same tick.
  `setOpen(true)` immediately followed by `setOpen(false)` left the component open instead of closed, and only worked if
  you awaited a microtask between the two calls.

  The last call in a tick now wins, and calling `setOpen` repeatedly with the same value still invokes `onOpenChange`
  once. Drawer's `api.setSnapPoint` had the same problem and behaves the same way now.

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`de9aeaa`](https://github.com/chakra-ui/zag/commit/de9aeaaf89ab8a6cc8e693fb068870a6f3d55205),
  [`82692cd`](https://github.com/chakra-ui/zag/commit/82692cd7307923c9648ece5ff4532b31108cf9f8),
  [`06be915`](https://github.com/chakra-ui/zag/commit/06be9152837570cfed4037985fb285e30ffef2c5)]:
  - @zag-js/dom-query@1.44.0
  - @zag-js/dismissable@1.44.0
  - @zag-js/focus-visible@1.44.0
  - @zag-js/core@1.44.0
  - @zag-js/popper@1.44.0
  - @zag-js/anatomy@1.44.0
  - @zag-js/types@1.44.0
  - @zag-js/collection@1.44.0
  - @zag-js/utils@1.44.0
  - @zag-js/rect-utils@1.44.0

## 1.43.3

### Patch Changes

- [`49ef963`](https://github.com/chakra-ui/zag/commit/49ef96354bb412690feacdb7ce7ba0a001b15c13) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Write optional properties as explicit `?: T | undefined` instead
  of wrapping them in `Partial` from `@zag-js/types`.

  That export shadowed the built-in `Partial`, which changed what `Partial<T>` meant in every file importing it and
  broke `@vue/compiler-sfc` on `interface X extends Partial<Y>`. Types like `IntlTranslations` and `ElementIds` are now
  plain interfaces. Passing a single translation key still works.

- Updated dependencies [[`49ef963`](https://github.com/chakra-ui/zag/commit/49ef96354bb412690feacdb7ce7ba0a001b15c13)]:
  - @zag-js/types@1.43.3
  - @zag-js/dom-query@1.43.3
  - @zag-js/core@1.43.3
  - @zag-js/dismissable@1.43.3
  - @zag-js/focus-visible@1.43.3
  - @zag-js/popper@1.43.3
  - @zag-js/anatomy@1.43.3
  - @zag-js/collection@1.43.3
  - @zag-js/utils@1.43.3
  - @zag-js/rect-utils@1.43.3

## 1.43.2

### Patch Changes

- Updated dependencies [[`3d019ee`](https://github.com/chakra-ui/zag/commit/3d019eede4ddd578be08f4d097e063b50481224f)]:
  - @zag-js/types@1.43.2
  - @zag-js/utils@1.43.2
  - @zag-js/dom-query@1.43.2
  - @zag-js/core@1.43.2
  - @zag-js/collection@1.43.2
  - @zag-js/dismissable@1.43.2
  - @zag-js/popper@1.43.2
  - @zag-js/focus-visible@1.43.2
  - @zag-js/anatomy@1.43.2
  - @zag-js/rect-utils@1.43.2

## 1.43.1

### Patch Changes

- [`96f21cd`](https://github.com/chakra-ui/zag/commit/96f21cd0d1fe556ff3b8e3f2b7d4a564054162eb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix keyboard navigation losing the highlighted item when scrolling
  shifts content beneath a resting pointer. The pointer events fired by that scroll were treated as a real hover and
  overrode the keyboard highlight. Affects listboxes with `highlightOnHover` and cascade selects with
  `highlightTrigger: "hover"`.
- Updated dependencies [[`c42b1d9`](https://github.com/chakra-ui/zag/commit/c42b1d99f22207f9d1958b58a073e79025a0ca21),
  [`9a9381d`](https://github.com/chakra-ui/zag/commit/9a9381d2dff80116623cb408a45f6622d04766b6),
  [`96f21cd`](https://github.com/chakra-ui/zag/commit/96f21cd0d1fe556ff3b8e3f2b7d4a564054162eb),
  [`11926f0`](https://github.com/chakra-ui/zag/commit/11926f0724f1be2ff26df18c1d498fd8742f3b00)]:
  - @zag-js/core@1.43.1
  - @zag-js/dom-query@1.43.1
  - @zag-js/dismissable@1.43.1
  - @zag-js/focus-visible@1.43.1
  - @zag-js/popper@1.43.1
  - @zag-js/anatomy@1.43.1
  - @zag-js/types@1.43.1
  - @zag-js/collection@1.43.1
  - @zag-js/utils@1.43.1
  - @zag-js/rect-utils@1.43.1

## 1.43.0

### Patch Changes

- Updated dependencies [[`0d23ef3`](https://github.com/chakra-ui/zag/commit/0d23ef3b607dc0954de9158db30d18ad236c80d2),
  [`5b2117e`](https://github.com/chakra-ui/zag/commit/5b2117e2cc10555768e668cf614b7e3599c87901),
  [`4e06700`](https://github.com/chakra-ui/zag/commit/4e067000907a18d0c77295bf29acf59ff424ca71),
  [`53944e0`](https://github.com/chakra-ui/zag/commit/53944e02589f410f0d4540560b0cf0faa2843b04)]:
  - @zag-js/dom-query@1.43.0
  - @zag-js/popper@1.43.0
  - @zag-js/core@1.43.0
  - @zag-js/dismissable@1.43.0
  - @zag-js/focus-visible@1.43.0
  - @zag-js/anatomy@1.43.0
  - @zag-js/types@1.43.0
  - @zag-js/collection@1.43.0
  - @zag-js/utils@1.43.0
  - @zag-js/rect-utils@1.43.0

## 1.42.0

### Patch Changes

- [`aef8880`](https://github.com/chakra-ui/zag/commit/aef8880b8a1b471dfa2966d5da8b06c1677086d5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where pressing `Enter` on a highlighted leaf node did
  not select it in non-React frameworks.

- Updated dependencies []:
  - @zag-js/anatomy@1.42.0
  - @zag-js/core@1.42.0
  - @zag-js/types@1.42.0
  - @zag-js/collection@1.42.0
  - @zag-js/utils@1.42.0
  - @zag-js/dismissable@1.42.0
  - @zag-js/dom-query@1.42.0
  - @zag-js/focus-visible@1.42.0
  - @zag-js/popper@1.42.0
  - @zag-js/rect-utils@1.42.0

## 1.41.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.41.2
  - @zag-js/core@1.41.2
  - @zag-js/types@1.41.2
  - @zag-js/collection@1.41.2
  - @zag-js/utils@1.41.2
  - @zag-js/dismissable@1.41.2
  - @zag-js/dom-query@1.41.2
  - @zag-js/focus-visible@1.41.2
  - @zag-js/popper@1.41.2
  - @zag-js/rect-utils@1.41.2

## 1.41.1

### Patch Changes

- Updated dependencies [[`b39524c`](https://github.com/chakra-ui/zag/commit/b39524c181ca435e304a02f146a121d0184baf1f)]:
  - @zag-js/dismissable@1.41.1
  - @zag-js/anatomy@1.41.1
  - @zag-js/core@1.41.1
  - @zag-js/types@1.41.1
  - @zag-js/collection@1.41.1
  - @zag-js/utils@1.41.1
  - @zag-js/dom-query@1.41.1
  - @zag-js/focus-visible@1.41.1
  - @zag-js/popper@1.41.1
  - @zag-js/rect-utils@1.41.1

## 1.41.0

### Patch Changes

- [#3130](https://github.com/chakra-ui/zag/pull/3130)
  [`005e8fa`](https://github.com/chakra-ui/zag/commit/005e8fafdcb1226fd2a3a07617a47cc76c2d823f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-side` to placement-aware parts based on the current
  placement.

- Updated dependencies [[`13cd5d5`](https://github.com/chakra-ui/zag/commit/13cd5d5141022a7212987bd7ccfd9d0999cb905f),
  [`027d513`](https://github.com/chakra-ui/zag/commit/027d5139da08fe0bf628c40e31dd488f1dde17d1),
  [`352f21e`](https://github.com/chakra-ui/zag/commit/352f21e170334a3fb50c2d9252ed45d1540ddd71),
  [`13cd5d5`](https://github.com/chakra-ui/zag/commit/13cd5d5141022a7212987bd7ccfd9d0999cb905f),
  [`0973473`](https://github.com/chakra-ui/zag/commit/09734734e78624f13b1a2d0fcf56c94a3b3ed6a7),
  [`020d79d`](https://github.com/chakra-ui/zag/commit/020d79d057438ba841c9fe1a88504938c23efe73),
  [`84b9e2b`](https://github.com/chakra-ui/zag/commit/84b9e2bdcbdc4e9404da94f13a663e5ff492be28)]:
  - @zag-js/core@1.41.0
  - @zag-js/dismissable@1.41.0
  - @zag-js/dom-query@1.41.0
  - @zag-js/popper@1.41.0
  - @zag-js/focus-visible@1.41.0
  - @zag-js/anatomy@1.41.0
  - @zag-js/types@1.41.0
  - @zag-js/collection@1.41.0
  - @zag-js/utils@1.41.0
  - @zag-js/rect-utils@1.41.0

## 1.40.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.40.0
  - @zag-js/core@1.40.0
  - @zag-js/types@1.40.0
  - @zag-js/collection@1.40.0
  - @zag-js/utils@1.40.0
  - @zag-js/dismissable@1.40.0
  - @zag-js/dom-query@1.40.0
  - @zag-js/focus-visible@1.40.0
  - @zag-js/popper@1.40.0
  - @zag-js/rect-utils@1.40.0

## 1.39.1

### Patch Changes

- Updated dependencies [[`44367ff`](https://github.com/chakra-ui/zag/commit/44367ffcf11d76953cae1eb4be5ebbaaf9439b82)]:
  - @zag-js/popper@1.39.1
  - @zag-js/anatomy@1.39.1
  - @zag-js/core@1.39.1
  - @zag-js/types@1.39.1
  - @zag-js/collection@1.39.1
  - @zag-js/utils@1.39.1
  - @zag-js/dismissable@1.39.1
  - @zag-js/dom-query@1.39.1
  - @zag-js/focus-visible@1.39.1
  - @zag-js/rect-utils@1.39.1

## 1.39.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.39.0
  - @zag-js/core@1.39.0
  - @zag-js/types@1.39.0
  - @zag-js/collection@1.39.0
  - @zag-js/utils@1.39.0
  - @zag-js/dismissable@1.39.0
  - @zag-js/dom-query@1.39.0
  - @zag-js/focus-visible@1.39.0
  - @zag-js/popper@1.39.0
  - @zag-js/rect-utils@1.39.0

## 1.38.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.38.2
  - @zag-js/core@1.38.2
  - @zag-js/types@1.38.2
  - @zag-js/collection@1.38.2
  - @zag-js/utils@1.38.2
  - @zag-js/dismissable@1.38.2
  - @zag-js/dom-query@1.38.2
  - @zag-js/focus-visible@1.38.2
  - @zag-js/popper@1.38.2
  - @zag-js/rect-utils@1.38.2

## 1.38.1

### Patch Changes

- Updated dependencies [[`2b4818c`](https://github.com/chakra-ui/zag/commit/2b4818c3b82ed1ca8ffd2cb44110a4a195ac68d6),
  [`2b4818c`](https://github.com/chakra-ui/zag/commit/2b4818c3b82ed1ca8ffd2cb44110a4a195ac68d6)]:
  - @zag-js/core@1.38.1
  - @zag-js/popper@1.38.1
  - @zag-js/anatomy@1.38.1
  - @zag-js/types@1.38.1
  - @zag-js/collection@1.38.1
  - @zag-js/utils@1.38.1
  - @zag-js/dismissable@1.38.1
  - @zag-js/dom-query@1.38.1
  - @zag-js/focus-visible@1.38.1
  - @zag-js/rect-utils@1.38.1

## 1.38.0

### Patch Changes

- Updated dependencies [[`4a395ad`](https://github.com/chakra-ui/zag/commit/4a395adb51b4ef1516acc7d5b03f78fa5130267c)]:
  - @zag-js/dom-query@1.38.0
  - @zag-js/core@1.38.0
  - @zag-js/dismissable@1.38.0
  - @zag-js/focus-visible@1.38.0
  - @zag-js/popper@1.38.0
  - @zag-js/anatomy@1.38.0
  - @zag-js/types@1.38.0
  - @zag-js/collection@1.38.0
  - @zag-js/utils@1.38.0
  - @zag-js/rect-utils@1.38.0

## 1.37.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.37.0
  - @zag-js/core@1.37.0
  - @zag-js/types@1.37.0
  - @zag-js/collection@1.37.0
  - @zag-js/utils@1.37.0
  - @zag-js/dismissable@1.37.0
  - @zag-js/dom-query@1.37.0
  - @zag-js/focus-visible@1.37.0
  - @zag-js/popper@1.37.0
  - @zag-js/rect-utils@1.37.0

## 1.36.0

### Patch Changes

- Updated dependencies [[`7edfd5e`](https://github.com/chakra-ui/zag/commit/7edfd5e6ffa0bddde524c9bd43aa157f3fb76b72)]:
  - @zag-js/dom-query@1.36.0
  - @zag-js/core@1.36.0
  - @zag-js/dismissable@1.36.0
  - @zag-js/focus-visible@1.36.0
  - @zag-js/popper@1.36.0
  - @zag-js/anatomy@1.36.0
  - @zag-js/types@1.36.0
  - @zag-js/collection@1.36.0
  - @zag-js/utils@1.36.0
  - @zag-js/rect-utils@1.36.0

## 1.35.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.35.3
  - @zag-js/core@1.35.3
  - @zag-js/types@1.35.3
  - @zag-js/collection@1.35.3
  - @zag-js/utils@1.35.3
  - @zag-js/dismissable@1.35.3
  - @zag-js/dom-query@1.35.3
  - @zag-js/focus-visible@1.35.3
  - @zag-js/popper@1.35.3
  - @zag-js/rect-utils@1.35.3

## 1.35.2

### Patch Changes

- Updated dependencies [[`01840ee`](https://github.com/chakra-ui/zag/commit/01840ee6f9672bedc784a2c434b84e8741e2dc25)]:
  - @zag-js/utils@1.35.2
  - @zag-js/core@1.35.2
  - @zag-js/collection@1.35.2
  - @zag-js/dismissable@1.35.2
  - @zag-js/popper@1.35.2
  - @zag-js/anatomy@1.35.2
  - @zag-js/types@1.35.2
  - @zag-js/dom-query@1.35.2
  - @zag-js/focus-visible@1.35.2
  - @zag-js/rect-utils@1.35.2

## 1.35.1

### Patch Changes

- Updated dependencies [[`2ab725f`](https://github.com/chakra-ui/zag/commit/2ab725f6cb4631dc8d790a3da53f8fb7713e7ec1)]:
  - @zag-js/core@1.35.1
  - @zag-js/anatomy@1.35.1
  - @zag-js/types@1.35.1
  - @zag-js/collection@1.35.1
  - @zag-js/utils@1.35.1
  - @zag-js/dismissable@1.35.1
  - @zag-js/dom-query@1.35.1
  - @zag-js/focus-visible@1.35.1
  - @zag-js/popper@1.35.1
  - @zag-js/rect-utils@1.35.1

## 1.35.0

### Patch Changes

- Updated dependencies [[`b0149ce`](https://github.com/chakra-ui/zag/commit/b0149cea73d2d975d0920d1a69561b6a85c9baa0)]:
  - @zag-js/core@1.35.0
  - @zag-js/anatomy@1.35.0
  - @zag-js/types@1.35.0
  - @zag-js/collection@1.35.0
  - @zag-js/utils@1.35.0
  - @zag-js/dismissable@1.35.0
  - @zag-js/dom-query@1.35.0
  - @zag-js/focus-visible@1.35.0
  - @zag-js/popper@1.35.0
  - @zag-js/rect-utils@1.35.0

## 1.34.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.34.1
  - @zag-js/core@1.34.1
  - @zag-js/types@1.34.1
  - @zag-js/collection@1.34.1
  - @zag-js/utils@1.34.1
  - @zag-js/dismissable@1.34.1
  - @zag-js/dom-query@1.34.1
  - @zag-js/focus-visible@1.34.1
  - @zag-js/popper@1.34.1
  - @zag-js/rect-utils@1.34.1

## 1.34.0

### Minor Changes

- [#2945](https://github.com/chakra-ui/zag/pull/2945)
  [`5f294a2`](https://github.com/chakra-ui/zag/commit/5f294a2963a237539513cf60967d609d0f68e503) Thanks
  [@anubra266](https://github.com/anubra266)! - **Cascade Select [New]**: Initial release of cascade select state
  machine

### Patch Changes

- [`f64e81f`](https://github.com/chakra-ui/zag/commit/f64e81f9f024db30c24d06ed33fbd0e4764393ed) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - **Cascade Select**: Fix API inconsistencies
  - Fix ElementIds: `list` param type (number → string), add `valuePath` param names with JSDoc for `list` and `item`
  - Rename `highlightedItem` to `highlightedItems` in API and context for consistency with HighlightChangeDetails
    callback
  - Fix `shouldCloseOnSelectHighlighted` guard: use last item in path for branch check (was passing array to
    isBranchNode)

- Updated dependencies [[`a20094f`](https://github.com/chakra-ui/zag/commit/a20094f6816a8a7899c82f7c866c632bb922b53c)]:
  - @zag-js/popper@1.34.0
  - @zag-js/anatomy@1.34.0
  - @zag-js/core@1.34.0
  - @zag-js/types@1.34.0
  - @zag-js/collection@1.34.0
  - @zag-js/utils@1.34.0
  - @zag-js/dismissable@1.34.0
  - @zag-js/dom-query@1.34.0
  - @zag-js/focus-visible@1.34.0
  - @zag-js/rect-utils@1.34.0
