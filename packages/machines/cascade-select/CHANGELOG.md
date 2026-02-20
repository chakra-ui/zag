# @zag-js/cascade-select

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
