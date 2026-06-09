export interface VirtualItem {
  index: number
  key: string | number
  start: number
  end: number
  size: number
  lane: number
  isVisible: boolean
  isOverscan: "before" | "after" | false
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
export type VirtualizerAnchor = "start" | "end"
export type FollowOnAppend = boolean | "auto" | "smooth" | "instant"
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
  /**
   * After the initial scroll, schedule a next-frame correction if the target
   * offset shifted (because items measured smaller/larger than estimated).
   * Defaults to true for non-smooth scrolls; ignored for smooth scrolls.
   */
  settle?: boolean
}

export interface ScrollToIndexResult {
  scrollTop?: number
  scrollLeft?: number
}

export interface ScrollByOptions {
  /** Enable smooth scrolling with custom options */
  smooth?: ScrollToIndexOptions["smooth"]
}

export interface ScrollToEndOptions extends ScrollByOptions {}

export interface VirtualRange {
  startIndex: number
  endIndex: number
}

export type Range = VirtualRange

export type RangeChangeReason = "scroll" | "resize" | "measurement" | "count" | "manual"

export interface RangeChangeDetails {
  range: VirtualRange
  reason: RangeChangeReason
}

export interface RangeExtractorContext {
  velocity: number
  direction: "forward" | "backward" | null
}

export type RangeExtractor = (range: Range, context: RangeExtractorContext) => number[]

export type VirtualizerOrientation = "vertical" | "horizontal"

export type VirtualizerDir = "ltr" | "rtl"

export type InitialMeasurements = Map<string | number, number> | Record<string, number>

export interface MeasureElementContext {
  index: number
  orientation: VirtualizerOrientation
}

export interface ShouldAdjustScrollOnSizeChangeContext {
  /** Item index whose measured size changed. */
  index: number
  /** Stable item key when `indexToKey` is provided, else the index key. */
  key: string | number
  /** New size minus previous size. Positive means growth, negative means shrink. */
  delta: number
  /** Item start offset before applying the measurement update. */
  itemStart: number
  /** Item end offset before applying the measurement update. */
  itemEnd: number
  /** Viewport start offset in list coordinates. */
  viewportStart: number
  /** Current logical scroll offset (without scrollMargin). */
  currentOffset: number
  /** Current scroll anchor (if one can be resolved). */
  anchor: ScrollAnchor | null
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

  /**
   * Customize the final set of item indexes to render for the calculated range.
   * The range passed to this function includes overscan.
   */
  rangeExtractor?: RangeExtractor

  /** Scroll orientation. Defaults to "vertical". */
  orientation?: VirtualizerOrientation

  /** Text direction. Defaults to "ltr"; affects positioning for horizontal virtualization. */
  dir?: VirtualizerDir

  /**
   * Note: `transform: scale(...)` on the scroll container is unsupported.
   * Scale transforms change layout and measurement coordinate spaces differently.
   */

  /** Scroll padding (start) */
  paddingStart?: number

  /** Scroll padding (end) */
  paddingEnd?: number

  /**
   * Offset where the virtual list starts relative to the scroll origin.
   * Useful when a header or other content appears before the virtual items.
   */
  scrollMargin?: number | (() => number)

  /** Offset to preserve before an item when scrolling to it */
  scrollPaddingStart?: number

  /** Offset to preserve after an item when scrolling to it */
  scrollPaddingEnd?: number

  /** Initial scroll offset */
  initialOffset?: number

  /**
   * Seed known item sizes before first range/layout pass.
   *
   * Accepts either:
   * - keyed sizes (`indexToKey` / `keyToIndex`)
   * - numeric indexes (when stable keys are not used)
   */
  initialMeasurements?: InitialMeasurements

  /** Skip applying `initialOffset` to the scroll container during init. */
  disableScrollOnInit?: boolean

  /** Root margin for intersection observer */
  rootMargin?: string

  /** Enable scroll anchor preservation during updates */
  preserveScrollAnchor?: boolean

  /**
   * Controls which side of the scrollable content is treated as the stable anchor.
   *
   * Use "end" for chat, logs, and reverse feeds where the latest item appears at
   * the end and the viewport should stay pinned while streaming output grows.
   */
  anchorTo?: VirtualizerAnchor

  /**
   * When used with `anchorTo: "end"`, follow appended items only if the viewport
   * was already at the end before the append. `true` is equivalent to "auto".
   */
  followOnAppend?: FollowOnAppend

  /**
   * Distance in pixels from the end that still counts as being at the end.
   * Used by `followOnAppend` and `isAtEnd()`.
   */
  scrollEndThreshold?: number

  /**
   * Control whether a measured size change should compensate the current scroll offset.
   *
   * Default behavior adjusts when the changed item starts above the current viewport.
   * This is useful for prepend/chat flows where items above the viewport are still
   * being measured after insertion.
   */
  shouldAdjustScrollOnSizeChange?: (context: ShouldAdjustScrollOnSizeChangeContext) => boolean

  /**
   * CSS `overflow-anchor` value for the virtualizer scroll container.
   * Defaults to "none" because the virtualizer preserves scroll position itself.
   */
  overflowAnchor?: "auto" | "none"

  /** Observe the scroll element size and automatically update virtualizer measurements */
  observeScrollElementSize?: boolean

  /**
   * Optional custom size measurer used by element-ref and eager remeasure paths.
   * Useful in test environments where DOM layout APIs report zero sizes.
   */
  measureElement?: (element: HTMLElement, context: MeasureElementContext) => number

  /** Callback when scroll state changes */
  onScroll?: (state: ScrollState) => void

  /** Callback after scrolling settles */
  onScrollEnd?: (state: ScrollState) => void

  /** Delay in milliseconds before scroll is considered settled (default: 150) */
  scrollEndDelay?: number

  /** Callback when visible range changes */
  onRangeChange?: (details: RangeChangeDetails) => void

  /** Callback when item visibility changes */
  onVisibilityChange?: (index: number, isVisible: boolean) => void
}

export interface ListVirtualizerOptions extends VirtualizerOptions {
  /** Optional grouping info for sticky headers */
  groups?: GroupMeta[]

  /** The initial viewport rect for server-side rendering. */
  initialRect?: { width: number; height: number }
}

export interface GroupMeta {
  /** Unique group id */
  id: string
  /** Starting item index for the group */
  startIndex: number
  /** Optional header height */
  headerSize?: number
  /** Whether this group participates in sticky header state. Defaults to true. */
  sticky?: boolean
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

  /** The initial viewport rect for server-side rendering. */
  initialRect?: { width: number; height: number }
}

export interface WaterfallColumnMetrics {
  index: number
  offset: number
  width: number
  height: number
}

export interface WaterfallLayoutState {
  columnCount: number
  columnWidth: number
  columnGap: number
  rowGap: number
  totalSize: number
  columns: WaterfallColumnMetrics[]
}

export type WaterfallLaneAssignment = "measured" | "preserve"

export interface WaterfallVirtualizerOptions extends Omit<VirtualizerOptions, "orientation" | "dir"> {
  /** Vertical-only in v1. */
  orientation?: "vertical"

  /** LTR-only in v1. */
  dir?: "ltr"

  /**
   * Number of columns. Takes precedence over `minColumnWidth` when provided.
   * Defaults to an auto-fit value based on `minColumnWidth`.
   */
  columnCount?: number

  /** Minimum width used to auto-fit columns when `columnCount` is not provided. */
  minColumnWidth?: number

  /** Gap between columns. Falls back to `gap`. */
  columnGap?: number

  /** Gap between items in a column. Falls back to `gap`. */
  rowGap?: number

  /**
   * Lane assignment strategy for masonry columns.
   * - `measured` (default): assign to the shortest current column.
   * - `preserve`: prefer a prior lane for already-laid-out items when still valid.
   */
  laneAssignment?: WaterfallLaneAssignment

  /** The initial viewport rect for server-side rendering. */
  initialRect?: { width: number; height: number }
}
