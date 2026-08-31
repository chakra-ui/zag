# @zag-js/cascade-select

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

- Updated dependencies [[`5820feb`](https://github.com/chakra-ui/zag/commit/5820febc81934f3d8d17e01f085aafe6dd81fc73),
  [`2d8aae2`](https://github.com/chakra-ui/zag/commit/2d8aae2f1588b5fdcfb6d7037b1d5f9994222dd7)]:
  - @zag-js/anatomy@2.0.0-next.0
  - @zag-js/types@2.0.0-next.0
  - @zag-js/rect-utils@2.0.0-next.0
  - @zag-js/dom-query@2.0.0-next.0
  - @zag-js/core@2.0.0-next.0
  - @zag-js/dismissable@2.0.0-next.0
  - @zag-js/focus-visible@2.0.0-next.0
  - @zag-js/popper@2.0.0-next.0
  - @zag-js/collection@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0

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
