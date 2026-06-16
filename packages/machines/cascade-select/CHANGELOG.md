# @zag-js/cascade-select

## 2.0.0-next.1

### Patch Changes

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
  [`8148d4d`](https://github.com/chakra-ui/zag/commit/8148d4dc44c1d3638869c2fdcf4d9e5fba14decd)]:
  - @zag-js/collection@2.0.0-next.1
  - @zag-js/popper@2.0.0-next.1
  - @zag-js/anatomy@2.0.0-next.1
  - @zag-js/core@2.0.0-next.1
  - @zag-js/types@2.0.0-next.1
  - @zag-js/utils@2.0.0-next.1
  - @zag-js/dismissable@2.0.0-next.1
  - @zag-js/dom-query@2.0.0-next.1
  - @zag-js/focus-visible@2.0.0-next.1
  - @zag-js/rect-utils@2.0.0-next.1

## 2.0.0-next.0

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
