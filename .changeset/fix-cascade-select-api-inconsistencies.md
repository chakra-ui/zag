---
"@zag-js/cascade-select": patch
---

**Cascade Select**: Fix API inconsistencies

- Fix ElementIds: `list` param type (number → string), add `valuePath` param names with JSDoc for `list` and `item`
- Rename `highlightedItem` to `highlightedItems` in API and context for consistency with HighlightChangeDetails callback
- Fix `shouldCloseOnSelectHighlighted` guard: use last item in path for branch check (was passing array to isBranchNode)
