---
"@zag-js/virtualizer": major
---

- **Breaking:** Replace the style, ARIA and measurement helpers with prop getters (`getRootProps`, `getContentProps`,
  `getItemProps`, and table and grid equivalents).

- **Breaking:** Listen to scroll in `init` and measure rendered items automatically. Remove `handleScroll` and the
  `measure*` refs.

  ```diff
  - <div ref={ref} onScroll={virtualizer.handleScroll} style={virtualizer.getContainerStyle()}>
  -   <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
  + <div ref={ref} {...virtualizer.getRootProps()}>
  +   <div {...virtualizer.getContentProps()}>
        {virtualizer.getVirtualItems().map((item) => (
  -       <div key={item.key} ref={item.measureElement} style={virtualizer.getItemStyle(item)}>
  +       <div key={item.key} {...virtualizer.getItemProps(item)}>
  ```

- **Breaking:** Default `scrollToIndex` and the grid's scroll methods to `align: "auto"`.

- **Breaking:** Rename `estimatedSize` to `estimatedItemSize`.

- **Breaking:** Remove `getItemState`, `getRenderedRange`, `setScrollElement` and `getScrollHandler`.

- Add `TableVirtualizer` for native tables, with column windowing and pinned columns.

- Add `itemSize`, `retainedIndexes`, `onEndReached`, `getTrailingProps`, `getItemMetrics`, `getIndexAtOffset` and
  `remeasure`.

- Add `aria: false` for items that carry their own semantics.

- Add development warnings for common setup mistakes.

- Fix `updateOptions` re-rendering for options rebuilt with the same content.

- Fix `scrollToIndex` ignoring the scrollbar, `padding` and `scroll-padding`.
