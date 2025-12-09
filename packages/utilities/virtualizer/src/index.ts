// Core virtualizer types that users need
export type {
  VirtualItem,
  ItemState,
  CSSProperties,
  ScrollState,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  AsyncScrollProgress,
  ScrollHistoryEntry,
  ScrollRestorationOptions,
  DOMOrderOptions,
  AdvancedOverscanOptions,
  Range,
  PerformanceMetrics,
  StickyConfig,
  ViewRecyclingStats,
  BaseVirtualizerOptions,
  ListVirtualizerOptions,
  GridVirtualizerOptions,
  MasonryVirtualizerOptions,
  TableVirtualizerOptions,
} from "./types"

export * from "./list-virtualizer"
export * from "./grid-virtualizer"
export * from "./masonry-virtualizer"
export * from "./table-virtualizer"
export * from "./window-virtualizer"

// Advanced types for velocity tracking
export type { VelocityState, OverscanCalculationResult } from "./velocity-tracker"

// Utility classes for advanced use cases
export { AutoSizer } from "./auto-sizer"
