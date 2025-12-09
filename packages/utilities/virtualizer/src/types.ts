export interface VirtualItem {
  index: number
  start: number
  end: number
  size: number
  lane: number
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

export interface ScrollToIndexOptions {
  align?: "start" | "center" | "end"
  behavior?: ScrollBehavior
  signal?: AbortSignal
  /** Enable smooth scrolling with custom options */
  smooth?:
    | boolean
    | {
        /** Duration of the scroll animation in milliseconds */
        duration?: number
        /** Easing function name or custom function */
        easing?:
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
          | ((t: number) => number)
        /** Custom scroll function */
        scrollFunction?: (position: { scrollTop?: number; scrollLeft?: number }) => void
      }
}

export interface ScrollToIndexResult {
  scrollTop?: number
  scrollLeft?: number
}

export interface AsyncScrollProgress {
  completed: number
  total: number
  stage: "measuring" | "calculating" | "scrolling"
}

export interface ScrollHistoryEntry {
  offset: number
  timestamp: number
  key?: string | number | undefined
  reason: "user" | "programmatic" | "resize" | "data-change"
}

export interface ScrollRestorationOptions {
  /** Enable scroll position restoration */
  enableScrollRestoration?: boolean
  /** Maximum number of history entries to keep */
  maxHistoryEntries?: number
  /** Key to identify scroll position for restoration */
  restorationKey?: string
  /** Tolerance for considering positions equal (in pixels) */
  restorationTolerance?: number
}

export interface DOMOrderOptions {
  /** Enable DOM order optimization to prevent layout thrashing */
  enableDOMOrderOptimization?: boolean
  /** Delay before reordering DOM elements (ms) */
  domReorderDelay?: number
}

export interface AdvancedOverscanOptions {
  /** Enable advanced overscan with velocity and direction awareness */
  enableAdvancedOverscan?: boolean
  /**
   * Overscan strategy to use:
   * - "adaptive": Dynamically adjusts based on scroll behavior (default)
   * - "conservative": Limits overscan to 2x base for memory efficiency
   * - "aggressive": Maximizes overscan to prevent white space during fast scroll
   * - "velocity": Same as aggressive, optimized for velocity-based calculations
   */
  overscanStrategy?: "adaptive" | "conservative" | "aggressive" | "velocity"
  /** Enable predictive overscan based on scroll patterns */
  enablePredictiveOverscan?: boolean
  /** Use directional overscan (more overscan in scroll direction) */
  enableDirectionalOverscan?: boolean
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

export interface BaseVirtualizerOptions extends ScrollRestorationOptions, DOMOrderOptions, AdvancedOverscanOptions {
  /** Function to get the container element - called when virtualizer needs it */
  getContainerEl?: () => HTMLElement | null

  /** Total number of items */
  count: number

  /** Estimated item size (height for vertical, width for horizontal) */
  estimatedSize: number

  /** Gap between items */
  gap?: number

  /** Overscan count - extra items to render outside viewport */
  overscan?: number

  /** Enable dynamic overscan based on scroll velocity */
  dynamicOverscan?: boolean

  /** Maximum overscan multiplier when scrolling fast */
  maxOverscanMultiplier?: number

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

  /** Use window scrolling instead of container */
  useWindowScroll?: boolean

  /** Root margin for intersection observer */
  rootMargin?: string

  /** Enable view recycling for better performance */
  enableViewRecycling?: boolean

  /** Enable scroll anchor preservation during updates */
  preserveScrollAnchor?: boolean

  /** Enable performance monitoring */
  enablePerfMonitoring?: boolean

  /** Enable automatic container size detection */
  enableAutoSizing?: boolean

  /** Callback when scroll state changes */
  onScroll?: (state: ScrollState) => void

  /** Callback when visible range changes */
  onRangeChange?: (range: Range) => void

  /** Callback when item visibility changes */
  onVisibilityChange?: (index: number, isVisible: boolean) => void

  /** Callback for performance metrics */
  onPerfMetrics?: (metrics: PerformanceMetrics) => void

  /** Callback when container is resized (auto-sizing only) */
  onContainerResize?: (size: { width: number; height: number }) => void

  /** Callback for async scroll progress */
  onAsyncScrollProgress?: (progress: AsyncScrollProgress) => void
}

export interface ListVirtualizerOptions extends BaseVirtualizerOptions {
  /** Get item size dynamically */
  getItemSize?: (index: number) => number

  /** Optional grouping info for sticky headers */
  groups?: GroupMeta[]
}

export interface GroupMeta {
  /** Unique group id */
  id: string
  /** Starting item index for the group */
  startIndex: number
  /** Optional header height */
  headerSize?: number
}

export interface TableVirtualizerOptions extends ListVirtualizerOptions {
  /** Optional sticky header height */
  headerHeight?: number
}

export interface GridVirtualizerOptions extends BaseVirtualizerOptions {
  /** Number of lanes (columns) */
  lanes: number
}

export interface MasonryVirtualizerOptions extends BaseVirtualizerOptions {
  /** Number of lanes (columns) */
  lanes: number

  /** Get masonry item size based on lane width */
  getMasonryItemSize?: (index: number, laneWidth: number) => number
}

export interface PerformanceMetrics {
  /** Time taken for last calculation (ms) */
  renderTime: number
  /** Current scroll frames per second */
  scrollFPS: number
  /** Number of items in measurement cache */
  cacheSize: number
  /** Cache hit rate percentage */
  cacheHitRate: number
  /** Current scroll velocity (px/ms) */
  scrollVelocity: number
  /** Number of visible items */
  visibleCount: number
  /** Total virtualized content size */
  totalSize: number
}

export interface StickyConfig {
  /** Indices that should stick during scroll */
  stickyIndices?: number[]
  /** How sticky items behave when scrolling */
  stickyBehavior?: "stack" | "push" | "overlay"
}

export interface ViewRecyclingStats {
  /** Total views in pool */
  poolSize: number
  /** Views currently in use */
  activeViews: number
  /** Views available for reuse */
  availableViews: number
  /** Total view reuses */
  reuseCount: number
}
