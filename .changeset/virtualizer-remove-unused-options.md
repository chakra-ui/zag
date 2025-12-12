---
"@zag-js/virtualizer": minor
---

Remove unused public types/options:

- `StickyConfig` (unused)
- `ScrollToIndexOptions.behavior` and `ScrollToIndexOptions.signal` (not handled by the core virtualizer)
- `enableViewRecycling` and `ViewRecyclingStats` (feature was unused/no-op)
- DOM order optimization options and APIs (`DOMOrderOptions`, `enableDOMOrderOptimization`, `domReorderDelay`)
- Perf monitoring options and types (`enablePerfMonitoring`, `onPerfMetrics`, `PerformanceMetrics`)
- Scroll element terminology cleanup:
  - `getScrollingEl` -> `getScrollElement`
  - `enableAutoSizing` -> `observeScrollElementSize`
  - `onContainerResize` -> `onScrollElementResize`
  - `setContainerSize` -> `setCrossAxisSize`
  - `getContainerSize` -> `getScrollElementSize`
- `ListVirtualizerOptions.getItemSize` removed (use `estimatedSize` + measurement instead)
- `MasonryVirtualizerOptions.getMasonryItemSize` removed (use `estimatedSize(index, laneWidth)` instead)
- `Virtualizer.getStats()` removed (internal/debug-only snapshot)
