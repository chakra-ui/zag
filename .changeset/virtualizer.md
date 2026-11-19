---
"@zag-js/virtualizer": major
---

- **Breaking:** Rename `estimatedSize` to `estimatedItemSize`. It accepts a number for uniform estimates or a function
  for per-item estimates, and a number is refined with the average measured size.

- **Breaking:** Default `scrollToIndex` to `align: "auto"`, which scrolls only when the item isn't fully visible and to
  the nearest edge. `GridVirtualizer`'s `scrollToCell`, `scrollToRow` and `scrollToColumn` take the same `align` option
  with the same default. Pass `align: "start"` for the previous behavior.

- Fix `scrollToIndex` leaving items hidden behind a horizontal scrollbar, and account for the scroll container's CSS
  `padding` and `scroll-padding` like `scrollIntoView` does.

- Add `itemSize` for fixed-size lists and window virtualizers, skipping per-item estimation and measurement.

- Add `retainedIndexes` to keep focused, highlighted, or dragged items mounted outside the viewport, and `isRetained` on
  the virtual items it holds.

- Add `TableVirtualizer` to virtualize a native `<table>`, with optional column windowing and pinned columns.

- Add `onEndReached` and `endReachedThreshold` to load the next page when the rendered range reaches the end.

- Add `measureTrailingElement` and `getTrailingStyle` for content after the last item, such as a loading row.

- Add `getItemMetrics`, `getIndexAtOffset` and `remeasure` for the geometry of unmounted items and layout changes.

- Add `estimatedGroupHeaderSize` for group headers rendered inside a group's first item.
