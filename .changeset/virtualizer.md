---
"@zag-js/virtualizer": major
---

- **Breaking:** Replace the style, ARIA and measurement helpers with prop getters, and measure rendered items
  automatically. `handleScroll`, the `measure*` refs, `getItemState`, `getRenderedRange`, `setScrollElement` and
  `getScrollHandler` are removed.

  ```diff
  - <div ref={ref} onScroll={virtualizer.handleScroll} style={virtualizer.getContainerStyle()}>
  -   <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
  + <div ref={ref} {...virtualizer.getRootProps()}>
  +   <div {...virtualizer.getContentProps()}>
        {virtualizer.getVirtualItems().map((item) => (
  -       <div key={item.key} ref={item.measureElement} style={virtualizer.getItemStyle(item)}>
  +       <div key={item.key} {...virtualizer.getItemProps(item)}>
  ```

- **Breaking:** Rename `estimatedSize` to `estimatedItemSize`, and default `scrollToIndex` and the grid's scroll methods
  to `align: "auto"`.

- Add `TableVirtualizer` for native tables, with column windowing and pinned columns.

- Add `stickToEnd`, `onStickToEndChange`, `scrollToEnd()` and `getStickToEndState()` for chat and log views. It keeps
  the newest item in view as items arrive, until the user scrolls up.

  ```ts
  const virtualizer = new ListVirtualizer({
    count: messages.length,
    estimatedItemSize: 60,
    stickToEnd: true,
    onStickToEndChange({ following, unseen }) {
      showJumpToLatest(!following && unseen)
    },
  })
  ```

- Add `itemSize`, `retainedIndexes`, `onEndReached`, `getTrailingProps`, `getItemMetrics`, `getIndexAtOffset`,
  `remeasure`, `aria: false`, and development warnings for common setup mistakes.

- Keep measured sizes by `indexToKey` through inserts, sorts and prepends, in lists, grids and waterfalls, and keep the
  view still when rows above it are measured.

- Fix items rendered during a fast scroll painting at their estimated positions and overlapping until scrolling stopped.

- Fix `scrollToIndex` ignoring the scrollbar, `padding` and `scroll-padding`, and `updateOptions` re-rendering for
  options rebuilt with the same content.

- Fit waterfall columns to the client width, so they no longer sit under the scrollbar.
