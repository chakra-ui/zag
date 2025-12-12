export interface VirtualItem {
  index: number
  key: string | number
  start: number
  end: number
  size: number
  lane: number
  measureElement: (element: HTMLElement | null) => void
}

export interface ItemState {
  index: number
  key: string | number
  position: { x: number; y: number }
  size: { width: number | string; height: number | string }
  isScrolling?: boolean
  isVisible?: boolean
}

export type CSSProperties = Record<string, string | number | undefined>

export interface ScrollState {
  offset: number
  direction: "forward" | "backward"
  isScrolling: boolean
}

export interface ScrollAnchor {
  /** Key of the anchor (usually the first visible item) */
  key: string | number
  /** Offset inside the anchor item (px) */
  offset: number
}

type ScrollAlignment = "start" | "center" | "end"
type ScrollEasingFunction = (t: number) => number
export type ScrollEasing =
  | ScrollEasingFunction
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeOutExpo"
  | "easeOutBack"

export interface ScrollToIndexOptions {
  align?: ScrollAlignment
  /** Enable smooth scrolling with custom options */
  smooth?:
    | boolean
    | {
        /** Duration of the scroll animation in milliseconds */
        duration?: number
        /** Easing function name or custom function */
        easing?: ScrollEasing
        /** Custom scroll function */
        scrollFunction?: (position: { scrollTop?: number; scrollLeft?: number }) => void
      }
}

export interface ScrollToIndexResult {
  scrollTop?: number
  scrollLeft?: number
}

export interface ScrollHistoryEntry {
  offset: number
  timestamp: number
  key?: string | number | undefined
  reason: "user" | "programmatic" | "resize" | "data-change"
}

export interface ScrollRestorationConfig {
  /** Maximum number of history entries to keep (default: 10) */
  maxEntries?: number
  /** Key to identify scroll position for restoration */
  key?: string
  /** Tolerance for considering positions equal in pixels (default: 5) */
  tolerance?: number
}

/** Internal options for ScrollRestorationManager */
export interface ScrollRestorationOptions {
  enableScrollRestoration?: boolean
  maxHistoryEntries?: number
  restorationKey?: string
  restorationTolerance?: number
}

export interface OverscanConfig {
  /** Base number of items to render outside viewport (default: 3) */
  count?: number
  /** Enable dynamic overscan based on scroll velocity */
  dynamic?: boolean
  /**
   * Strategy for calculating overscan:
   * - "adaptive": Dynamically adjusts based on scroll behavior (default)
   * - "conservative": Limits overscan to 2x base for memory efficiency
   * - "aggressive": Maximizes overscan to prevent white space during fast scroll
   */
  strategy?: "adaptive" | "conservative" | "aggressive"
  /** Maximum multiplier for dynamic overscan (default: 3) */
  maxMultiplier?: number
  /** Add more overscan in scroll direction */
  directional?: boolean
  /** Enable predictive overscan based on scroll patterns */
  predictive?: boolean
}

export interface Range {
  startIndex: number
  endIndex: number
}

export interface MeasureCache {
  size: number
  start: number
  end: number
}

export interface VirtualizerBaseOptions {
  /**
   * Function to get the scroll element - called when the virtualizer needs it.
   */
  getScrollElement?: () => HTMLElement | null
  /**
   * Get a stable key for an item at an index. This is critical for:
   * - preserving scroll position across insertions/removals
   * - chat-style "prepend older items" without scroll jump
   *
   * If omitted, `index` is used as the key.
   */
  indexToKey?: (index: number) => string | number
  /**
   * Optional inverse mapping for `indexToKey`.
   * If provided, enables O(1) anchor restoration by key.
   */
  keyToIndex?: ((key: string | number) => number) | undefined

  /** Total number of items */
  count: number

  /**
   * Estimated item size (height for vertical, width for horizontal).
   *
   * For masonry layouts, the estimate may depend on the current `laneWidth`.
   */
  estimatedSize: (index: number, laneWidth?: number) => number

  /** Gap between items */
  gap?: number

  /**
   * Overscan configuration - extra items to render outside viewport.
   */
  overscan?: OverscanConfig

  /**
   * Scroll restoration configuration - enables saving and restoring scroll position.
   */
  scrollRestoration?: ScrollRestorationConfig

  /** Horizontal scrolling */
  horizontal?: boolean

  /** RTL (Right-to-Left) mode - affects positioning for horizontal virtualization */
  rtl?: boolean

  /** Scroll padding (start) */
  paddingStart?: number

  /** Scroll padding (end) */
  paddingEnd?: number

  /** Initial scroll offset */
  initialOffset?: number

  /** Root margin for intersection observer */
  rootMargin?: string

  /** Enable scroll anchor preservation during updates */
  preserveScrollAnchor?: boolean

  /** Observe the scroll element size and automatically update virtualizer measurements */
  observeScrollElementSize?: boolean

  /** Callback when scroll state changes */
  onScroll?: (state: ScrollState) => void

  /** Callback when visible range changes */
  onRangeChange?: (range: Range) => void

  /** Callback when item visibility changes */
  onVisibilityChange?: (index: number, isVisible: boolean) => void

  /** Callback when scroll element is resized (observeScrollElementSize only) */
  onScrollElementResize?: (size: { width: number; height: number }) => void
}

/** Alias for VirtualizerBaseOptions */
export type VirtualizerOptions = VirtualizerBaseOptions

export interface ListVirtualizerOptions extends VirtualizerBaseOptions {
  /** Number of lanes (columns for vertical, rows for horizontal). Defaults to 1. */
  lanes?: number

  /** Optional grouping info for sticky headers */
  groups?: GroupMeta[]

  /**
   * The initial size of the viewport for server-side rendering.
   * This should be the height for vertical lists or the width for horizontal lists.
   */
  initialSize?: number
}

export interface GroupMeta {
  /** Unique group id */
  id: string
  /** Starting item index for the group */
  startIndex: number
  /** Optional header height */
  headerSize?: number
}

export interface GridVirtualizerOptions extends Omit<VirtualizerBaseOptions, "count" | "estimatedSize"> {
  /** Number of rows in the grid */
  rowCount: number

  /** Number of columns in the grid */
  columnCount: number

  /** Estimated row height for each row */
  estimatedRowSize: (rowIndex: number) => number

  /** Estimated column width for each column */
  estimatedColumnSize: (columnIndex: number) => number

  /** Callback when horizontal scroll changes */
  onHorizontalScroll?: (offset: number) => void

  /**
   * The initial size of the viewport for server-side rendering.
   * @see https://tanstack.com/virtual/v3/docs/framework/react/ssr
   */
  initialSize?: { width: number; height: number }
}

/** Virtual cell for grid virtualizer */
export interface VirtualCell {
  /** Row index */
  row: number
  /** Column index */
  column: number
  /** X position (left offset) */
  x: number
  /** Y position (top offset) */
  y: number
  /** Cell width */
  width: number
  /** Cell height */
  height: number
  /** Ref callback for measuring cell */
  measureElement: (element: HTMLElement | null) => void
}

export interface MasonryVirtualizerOptions extends VirtualizerBaseOptions {
  /** Number of lanes (columns) */
  lanes: number
}
