// Core virtualizer types that users need
export type {
  CSSProperties,
  GridVirtualizerOptions,
  ItemState,
  ListVirtualizerOptions,
  MasonryVirtualizerOptions,
  OverscanConfig,
  Range,
  ScrollHistoryEntry,
  ScrollAnchor,
  ScrollRestorationConfig,
  ScrollState,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  VirtualCell,
  VirtualItem,
  VirtualizerOptions,
} from "./types"

export * from "./grid-virtualizer"
export * from "./list-virtualizer"
export * from "./masonry-virtualizer"
export * from "./window-virtualizer"

// Advanced types for velocity tracking
export type { OverscanCalculationResult, VelocityState } from "./utils/velocity-tracker"

// Utility classes for advanced use cases
export { SizeObserver } from "./utils/size-observer"

// Shared utilities
export { resolveOverscanConfig, DEFAULT_OVERSCAN_CONFIG, SCROLL_END_DELAY_MS } from "./utils/overscan"
export { getScrollPositionFromEvent, type ScrollPosition } from "./utils/scroll-helpers"
