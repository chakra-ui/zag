export interface VirtualItem {
  index: number
  key: string | number
  start: number
  end: number
  size: number
  lane: number
  measureElement: (element: HTMLElement | null) => void
}

/** Measured layout for one item along the scroll axis (`start`/`end` are offsets; `size` is the span). */
export interface ItemMeasurement {
  start: number
  size: number
  end: number
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

/** Handle returned by `setTimeout` — use with `clearTimeout`. */
export type TimerId = ReturnType<typeof setTimeout>

export type ScrollAxisDirection = "forward" | "backward" | "idle"

export interface ScrollState {
  offset: { x: number; y: number }
  direction: { x: ScrollAxisDirection; y: ScrollAxisDirection }
  isScrolling: boolean
}

export interface ScrollAnchor {
  /** Key of the anchor (usually the first visible item) */
  key: string | number
  /** Offset inside the anchor item (px) */
  offset: number
}

type ScrollAlignment = "start" | "center" | "end" | "auto"
export type ScrollEasing = (t: number) => number

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

export interface Range {
  startIndex: number
  endIndex: number
}

export interface VirtualizerOptions {
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

  /** Number of extra items to render outside the visible viewport (default: 3) */
  overscan?: number

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
}

export interface ListVirtualizerOptions extends VirtualizerOptions {
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

export interface GridVirtualizerOptions extends Omit<VirtualizerOptions, "count" | "estimatedSize"> {
  /** Number of rows in the grid */
  rowCount: number

  /** Number of columns in the grid */
  columnCount: number

  /** Estimated row height for each row */
  estimatedRowSize: (rowIndex: number) => number

  /** Estimated column width for each column */
  estimatedColumnSize: (columnIndex: number) => number

  /** The initial size of the viewport for server-side rendering. */
  initialSize?: { width: number; height: number }
}
