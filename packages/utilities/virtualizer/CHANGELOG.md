# @zag-js/virtualizer

## 2.0.0-next.5

### Major Changes

- [#3648](https://github.com/chakra-ui/zag/pull/3648)
  [`3193852`](https://github.com/chakra-ui/zag/commit/3193852eb312d15617838f053e37783a5bf194f6) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - **Breaking:** Replace the style, ARIA and measurement
  helpers with prop getters, and measure rendered items automatically. `handleScroll`, the `measure*` refs,
  `getItemState`, `getRenderedRange`, `setScrollElement` and `getScrollHandler` are removed.

  ```diff
  - <div ref={ref} onScroll={virtualizer.handleScroll} style={virtualizer.getContainerStyle()}>
  -   <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
  + <div ref={ref} {...virtualizer.getRootProps()}>
  +   <div {...virtualizer.getContentProps()}>
        {virtualizer.getVirtualItems().map((item) => (
  -       <div key={item.key} ref={item.measureElement} style={virtualizer.getItemStyle(item)}>
  +       <div key={item.key} {...virtualizer.getItemProps(item)}>
  ```

  - **Breaking:** Rename `estimatedSize` to `estimatedItemSize`, and default `scrollToIndex` and the grid's scroll
    methods to `align: "auto"`.

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

  - Keep measured sizes by `indexToKey` through inserts, sorts and prepends, in lists, grids and waterfalls, and keep
    the view still when rows above it are measured.

  - Fix items rendered during a fast scroll painting at their estimated positions and overlapping until scrolling
    stopped.

  - Fix `scrollToIndex` ignoring the scrollbar, `padding` and `scroll-padding`, and `updateOptions` re-rendering for
    options rebuilt with the same content.

  - Fit waterfall columns to the client width, so they no longer sit under the scrollbar.

### Patch Changes

- Updated dependencies [[`3193852`](https://github.com/chakra-ui/zag/commit/3193852eb312d15617838f053e37783a5bf194f6),
  [`3193852`](https://github.com/chakra-ui/zag/commit/3193852eb312d15617838f053e37783a5bf194f6),
  [`3193852`](https://github.com/chakra-ui/zag/commit/3193852eb312d15617838f053e37783a5bf194f6)]:
  - @zag-js/dom-query@2.0.0-next.5
  - @zag-js/types@2.0.0-next.5
  - @zag-js/utils@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633)]:
  - @zag-js/dom-query@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- [#3308](https://github.com/chakra-ui/zag/pull/3308)
  [`2233444`](https://github.com/chakra-ui/zag/commit/22334447b60d1640c004f088a828e9de39d48de2) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Fixed issue where a grid virtualizer reused after
  `destroy()` reported a total size of zero, leaving the scroller with nothing to scroll (React Strict Mode remount).
  `init()` now rebuilds the size trackers `destroy()` released, and notifies subscribers so they re-render with the
  restored size.

- [#3308](https://github.com/chakra-ui/zag/pull/3308)
  [`aa2b456`](https://github.com/chakra-ui/zag/commit/aa2b45686df65373557eabbfac967ae1e7ac090f) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Fixed issues with the generated style helpers.

  - Fixed issue where `getContentStyle()` and related helpers returned unitless numbers that browsers ignore as CSS.
  - Fixed issue where the content element shrank inside a flex scroller. `getContentStyle()` now sets `flex-shrink: 0`.

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- [`8b3f4e5`](https://github.com/chakra-ui/zag/commit/8b3f4e5e03adcad5ff5e37e573d2e00822f340c7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fixed issue where `init()` after `destroy()` left the instance
  inert (React Strict Mode remount). Scroll and store updates are ignored while `isDestroyed` is true, and `init()` did
  not clear that flag.
- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.0
