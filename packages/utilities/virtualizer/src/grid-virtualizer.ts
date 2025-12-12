import type { CSSProperties, GridVirtualizerOptions, OverscanConfig, Range, VirtualCell } from "./types"
import { SizeObserver } from "./utils/size-observer"
import { ScrollRestorationManager } from "./utils/scroll-restoration-manager"
import { resolveOverscanConfig, SCROLL_END_DELAY_MS } from "./utils/overscan"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"
import { debounce, rafThrottle } from "./utils/debounce"
import { shallowCompare } from "./utils/shallow-compare"
import { CacheManager } from "./utils/cache-manager"
import { SizeTracker } from "./utils/size-tracker"

interface GridRange {
  startRow: number
  endRow: number
  startColumn: number
  endColumn: number
}

type ResolvedOptions = Required<
  Omit<
    GridVirtualizerOptions,
    | "onScroll"
    | "onRangeChange"
    | "onHorizontalScroll"
    | "onVisibilityChange"
    | "onScrollElementResize"
    | "overscan"
    | "scrollRestoration"
  >
> &
  Pick<
    GridVirtualizerOptions,
    "onScroll" | "onRangeChange" | "onHorizontalScroll" | "onVisibilityChange" | "onScrollElementResize"
  > & {
    overscan: Required<OverscanConfig>
    scrollRestoration?: GridVirtualizerOptions["scrollRestoration"]
  }

/**
 * Virtualizer for 2D grid layouts with both row and column virtualization.
 * Ideal for spreadsheets, data tables, calendars, and other true grid structures.
 */
export class GridVirtualizer {
  private options: ResolvedOptions

  // Scroll state
  private scrollTop = 0
  private scrollLeft = 0
  private isScrolling = false
  private scrollEndTimer: ReturnType<typeof setTimeout> | null = null
  private debouncedScrollEnd: ReturnType<typeof debounce> | null = null
  private rafUpdateRange: ReturnType<typeof rafThrottle> | null = null

  // Viewport dimensions
  private viewportWidth = 0
  private viewportHeight = 0

  // Visible range
  private range: GridRange = { startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }
  private lastScrollTop = -1
  private lastScrollLeft = -1
  private rangeCache!: CacheManager<string, GridRange>
  private virtualCellCache!: CacheManager<string, VirtualCell>

  // Size tracking with Fenwick tree optimization
  private rowSizeTracker!: SizeTracker
  private columnSizeTracker!: SizeTracker

  // Scroll element
  private scrollElement: Element | Window | null = null

  // Auto-sizing
  private sizeObserver?: SizeObserver

  // Scroll restoration
  private scrollTopRestoration?: ScrollRestorationManager
  private scrollLeftRestoration?: ScrollRestorationManager

  constructor(options: GridVirtualizerOptions) {
    const overscan = resolveOverscanConfig(options.overscan)

    this.options = {
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      initialOffset: 0,
      horizontal: false,
      rtl: false,
      rootMargin: "50px",
      preserveScrollAnchor: true,
      observeScrollElementSize: false,
      ...options,
      overscan,
    } as ResolvedOptions

    if (options.initialSize) {
      this.viewportWidth = options.initialSize.width
      this.viewportHeight = options.initialSize.height
    }

    this.initializeScrollHandlers()
    this.initializeMeasurements()
    this.initializeAutoSizing()
    this.initializeScrollRestoration()
  }

  /**
   * Initialize the grid virtualizer with a concrete scroll element.
   * This avoids the common "ref is null during construction" issue.
   */
  init(scrollElement: HTMLElement): void {
    if (this.scrollElement && this.scrollElement !== scrollElement) {
      this.detachScrollListener()
    }
    this.scrollElement = scrollElement
    this.scrollListenerAttached = false

    // Observe size if enabled
    this.initializeScrollingElement()

    // Prime measurements
    this.measure()

    // Attach listener eagerly now that we have the element
    this.attachScrollListener()
  }

  private initializeScrollHandlers(): void {
    // Create debounced scroll end handler
    this.debouncedScrollEnd = debounce(() => {
      this.isScrolling = false
      this.scrollTopRestoration?.recordScrollPosition(this.scrollTop, "user")
      this.scrollLeftRestoration?.recordScrollPosition(this.scrollLeft, "user")

      this.options.onScroll?.({
        offset: this.scrollTop,
        direction: this.scrollTop > this.lastScrollTop ? "forward" : "backward",
        isScrolling: false,
      })
    }, SCROLL_END_DELAY_MS)

    // Create RAF-throttled range update for smooth scrolling
    this.rafUpdateRange = rafThrottle((fn: () => void) => fn())
  }

  private initializeScrollRestoration(): void {
    if (this.options.scrollRestoration) {
      const { scrollRestoration } = this.options
      const key = scrollRestoration.key ?? "default"
      const maxEntries = scrollRestoration.maxEntries ?? 10
      const tolerance = scrollRestoration.tolerance ?? 5

      this.scrollTopRestoration = new ScrollRestorationManager({
        enableScrollRestoration: true,
        maxHistoryEntries: maxEntries,
        restorationKey: `${key}-top`,
        restorationTolerance: tolerance,
      })
      this.scrollLeftRestoration = new ScrollRestorationManager({
        enableScrollRestoration: true,
        maxHistoryEntries: maxEntries,
        restorationKey: `${key}-left`,
        restorationTolerance: tolerance,
      })
    }
  }

  private initializeMeasurements(): void {
    this.resetMeasurements()
  }

  private resetMeasurements(): void {
    const { rowCount, columnCount, gap } = this.options

    // Lazy initialize caches if not already created
    if (!this.rangeCache) {
      this.rangeCache = new CacheManager<string, GridRange>(100)
    }
    if (!this.virtualCellCache) {
      this.virtualCellCache = new CacheManager<string, VirtualCell>(200)
    }

    // Initialize or reset size trackers with Fenwick tree optimization
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(rowCount, gap, (i) => this.options.estimatedRowSize(i))
    } else {
      this.rowSizeTracker.reset(rowCount)
    }

    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(columnCount, gap, (i) => this.options.estimatedColumnSize(i))
    } else {
      this.columnSizeTracker.reset(columnCount)
    }
  }

  private onItemsChanged(): void {
    if (this.rowSizeTracker) {
      this.rowSizeTracker.clearMeasurements()
    }
    if (this.columnSizeTracker) {
      this.columnSizeTracker.clearMeasurements()
    }
    this.resetMeasurements()
  }

  private onRowMeasured(index: number, size: number): boolean {
    // Initialize size tracker if needed
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }

    const changed = this.rowSizeTracker.setMeasuredSize(index, size)
    if (!changed) return false

    // Clear range cache as measurements changed
    if (this.rangeCache) {
      this.rangeCache.clear()
    }

    return true
  }

  private onColumnMeasured(index: number, size: number): boolean {
    // Initialize size tracker if needed
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }

    const changed = this.columnSizeTracker.setMeasuredSize(index, size)
    if (!changed) return false

    // Clear range cache as measurements changed
    if (this.rangeCache) {
      this.rangeCache.clear()
    }

    return true
  }

  /**
   * Initialize auto-sizing if enabled
   */
  private initializeAutoSizing(): void {
    if (!this.options.observeScrollElementSize) return

    this.sizeObserver = new SizeObserver({
      onResize: (size) => {
        this.setViewportSize(size.width, size.height)
        this.options.onScrollElementResize?.(size)
        this.scrollTopRestoration?.handleResize(this.scrollTop)
        this.scrollLeftRestoration?.handleResize(this.scrollLeft)
      },
    })

    // Scroll element size observation is wired during `init(element)`
    this.initializeScrollingElement()
  }

  /**
   * Initialize scrolling element observation
   */
  private initializeScrollingElement(): void {
    if (!this.sizeObserver) return

    if (this.scrollElement) {
      this.sizeObserver.observe(this.scrollElement as Element)
    }
  }

  /**
   * Get estimated row size for a specific row
   */
  private getRowSize(rowIndex: number): number {
    // Initialize size tracker if needed
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }
    return this.rowSizeTracker.getSize(rowIndex)
  }

  /**
   * Get estimated column size for a specific column
   */
  private getColumnSize(columnIndex: number): number {
    // Initialize size tracker if needed
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }
    return this.columnSizeTracker.getSize(columnIndex)
  }

  private getPrefixRowSize(index: number): number {
    // Initialize size tracker if needed
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }
    return this.rowSizeTracker.getPrefixSum(index)
  }

  private getPrefixColumnSize(index: number): number {
    // Initialize size tracker if needed
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }
    return this.columnSizeTracker.getPrefixSum(index)
  }

  /**
   * Optimized binary search for finding row index at offset
   */
  private findRowIndexAtOffsetBinary(targetOffset: number): number {
    // Initialize size tracker if needed
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }
    return this.rowSizeTracker.findIndexAtOffset(targetOffset, this.options.paddingStart)
  }

  /**
   * Optimized binary search for finding column index at offset
   */
  private findColumnIndexAtOffsetBinary(targetOffset: number): number {
    // Initialize size tracker if needed
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }
    return this.columnSizeTracker.findIndexAtOffset(targetOffset, this.options.paddingStart)
  }

  /**
   * Calculate visible range based on scroll position
   */
  private calculateRange(): void {
    // Skip if already calculated for this scroll position
    if (this.lastScrollTop === this.scrollTop && this.lastScrollLeft === this.scrollLeft) {
      return
    }

    const { rowCount, columnCount, overscan } = this.options

    if (rowCount === 0 || columnCount === 0 || this.viewportHeight === 0 || this.viewportWidth === 0) {
      this.range = { startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }
      this.lastScrollTop = this.scrollTop
      this.lastScrollLeft = this.scrollLeft
      return
    }

    this.attachScrollListener()

    // Check cache first
    const cacheKey = `${this.scrollTop}:${this.scrollLeft}:${this.viewportHeight}:${this.viewportWidth}`
    const cached = this.rangeCache.get(cacheKey)
    if (cached) {
      this.range = cached
      this.lastScrollTop = this.scrollTop
      this.lastScrollLeft = this.scrollLeft
      return
    }

    // Find visible rows using binary search
    const startRow = this.findRowIndexAtOffsetBinary(this.scrollTop)
    const endRow = this.findRowIndexAtOffsetBinary(this.scrollTop + this.viewportHeight)

    // Find visible columns using binary search
    const startColumn = this.findColumnIndexAtOffsetBinary(this.scrollLeft)
    const endColumn = this.findColumnIndexAtOffsetBinary(this.scrollLeft + this.viewportWidth)

    // Apply overscan
    const newRange: GridRange = {
      startRow: Math.max(0, startRow - overscan.count),
      endRow: Math.min(rowCount - 1, endRow + overscan.count),
      startColumn: Math.max(0, startColumn - overscan.count),
      endColumn: Math.min(columnCount - 1, endColumn + overscan.count),
    }

    const rangeChanged = !shallowCompare(this.range, newRange)

    if (rangeChanged) {
      this.range = newRange
      this.options.onRangeChange?.({ startIndex: newRange.startRow, endIndex: newRange.endRow })
    }

    this.lastScrollTop = this.scrollTop
    this.lastScrollLeft = this.scrollLeft

    // Cache the result (CacheManager handles LRU eviction automatically)
    this.rangeCache.set(cacheKey, newRange)
  }

  /**
   * Get all virtual cells that should be rendered
   */
  getVirtualCells(): VirtualCell[] {
    this.calculateRange()

    const { startRow, endRow, startColumn, endColumn } = this.range
    const cells: VirtualCell[] = []

    // Clean up virtual cell cache for cells outside new range
    for (const [key] of this.virtualCellCache) {
      const [row, col] = key.split(",").map(Number)
      if (row < startRow - 10 || row > endRow + 10 || col < startColumn - 10 || col > endColumn + 10) {
        this.virtualCellCache.delete(key)
      }
    }

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColumn; col <= endColumn; col++) {
        const cellKey = `${row},${col}`

        // Try to reuse cached virtual cell
        let cachedCell = this.virtualCellCache.get(cellKey)

        const x = this.getPrefixColumnSize(col - 1) + this.options.paddingStart
        const y = this.getPrefixRowSize(row - 1) + this.options.paddingStart
        const width = this.getColumnSize(col)
        const height = this.getRowSize(row)

        if (
          cachedCell &&
          cachedCell.x === x &&
          cachedCell.y === y &&
          cachedCell.width === width &&
          cachedCell.height === height
        ) {
          // Reuse cached cell object - no allocation
          cells.push(cachedCell)
        } else {
          // Create or update virtual cell
          const virtualCell: VirtualCell = cachedCell || {
            row,
            column: col,
            x,
            y,
            width,
            height,
            measureElement: (el: HTMLElement | null) => {
              if (el) this.measureCell(el, row, col)
            },
          }

          // Update properties if reusing object
          if (cachedCell) {
            virtualCell.x = x
            virtualCell.y = y
            virtualCell.width = width
            virtualCell.height = height
          }

          this.virtualCellCache.set(cellKey, virtualCell)
          cells.push(virtualCell)
        }
      }
    }

    return cells
  }

  private measureCell(el: HTMLElement, row: number, col: number) {
    const rect = el.getBoundingClientRect()

    const rowNeedsUpdate = this.onRowMeasured(row, rect.height)
    const colNeedsUpdate = this.onColumnMeasured(col, rect.width)

    if (rowNeedsUpdate || colNeedsUpdate) {
      this.forceUpdate()
    }
  }

  /**
   * Get style for a virtual cell
   */
  getCellStyle(cell: VirtualCell): CSSProperties {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: cell.width,
      height: cell.height,
      transform: `translate3d(${cell.x}px, ${cell.y}px, 0)`,
    }
  }

  /**
   * Get container style
   */
  getContainerStyle(): CSSProperties {
    return {
      position: "relative",
      overflow: "auto",
      willChange: "scroll-position",
      WebkitOverflowScrolling: "touch",
    }
  }

  /**
   * Get content/spacer style
   */
  getContentStyle(): CSSProperties {
    return {
      position: "relative",
      width: this.getTotalWidth(),
      height: this.getTotalHeight(),
      pointerEvents: this.isScrolling ? "none" : "auto",
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll = (event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }): void => {
    const { scrollTop, scrollLeft } = getScrollPositionFromEvent(event)

    // Quick exit if nothing changed
    if (scrollTop === this.scrollTop && scrollLeft === this.scrollLeft) return

    const scrollLeftChanged = this.scrollLeft !== scrollLeft
    const wasScrolling = this.isScrolling

    this.scrollTop = scrollTop
    this.scrollLeft = scrollLeft
    this.isScrolling = true

    // Use RAF throttling for smoother updates during fast scrolling
    if (this.rafUpdateRange) {
      this.rafUpdateRange(() => {
        this.calculateRange()
        if (scrollLeftChanged) {
          this.options.onHorizontalScroll?.(scrollLeft)
        }
      })
    } else {
      // Fallback to immediate calculation
      this.calculateRange()
      if (scrollLeftChanged) {
        this.options.onHorizontalScroll?.(scrollLeft)
      }
    }

    // Debounced scroll end detection
    if (this.debouncedScrollEnd) {
      this.debouncedScrollEnd()
    } else if (!wasScrolling) {
      // First scroll event - notify immediately
      this.options.onScroll?.({
        offset: scrollTop,
        direction: scrollTop > this.lastScrollTop ? "forward" : "backward",
        isScrolling: true,
      })
    }
  }

  /**
   * Get scroll handler for container
   */
  getScrollHandler() {
    return this.handleScroll
  }

  /**
   * Attach scroll listener
   */
  private scrollListenerAttached = false
  private attachScrollListener(): void {
    if (this.scrollListenerAttached) return
    if (typeof window === "undefined") return

    if (!this.scrollElement) {
      throw new Error(
        "[@zag-js/virtualizer] Missing scroll element. Call `virtualizer.init(element)` before reading virtual cells.",
      )
    }

    this.scrollElement.addEventListener("scroll", this.handleScroll, { passive: true })
    this.scrollListenerAttached = true
  }
  /**
   * Detach scroll listener
   */
  private detachScrollListener(): void {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener("scroll", this.handleScroll)
      this.scrollElement = null
      this.scrollListenerAttached = false
    }
  }

  /**
   * Set viewport dimensions
   */
  setViewportSize(width: number, height: number): void {
    this.viewportWidth = width
    this.viewportHeight = height
    this.lastScrollTop = -1
    this.lastScrollLeft = -1
    this.calculateRange()
  }

  /**
   * Measure the scroll container and set viewport size.
   */
  measure(): void {
    if (!this.scrollElement) return
    const rect = (this.scrollElement as Element).getBoundingClientRect()
    this.setViewportSize(rect.width, rect.height)
  }

  /**
   * Get total width
   */
  getTotalWidth(): number {
    const { columnCount, paddingStart, paddingEnd } = this.options
    if (columnCount === 0) return paddingStart + paddingEnd

    // Initialize size tracker if needed
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }

    return this.columnSizeTracker.getTotalSize(paddingStart, paddingEnd)
  }

  /**
   * Get total height
   */
  getTotalHeight(): number {
    const { rowCount, paddingStart, paddingEnd } = this.options
    if (rowCount === 0) return paddingStart + paddingEnd

    // Initialize size tracker if needed
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }

    return this.rowSizeTracker.getTotalSize(paddingStart, paddingEnd)
  }

  /**
   * Get current range
   */
  getRange(): GridRange {
    return { ...this.range }
  }

  /**
   * Get visible row range
   */
  getVisibleRowRange(): Range {
    return { startIndex: this.range.startRow, endIndex: this.range.endRow }
  }

  /**
   * Get visible column range
   */
  getVisibleColumnRange(): Range {
    return { startIndex: this.range.startColumn, endIndex: this.range.endColumn }
  }

  /**
   * Scroll to specific row and column
   */
  scrollToCell(row: number, column: number): { scrollTop: number; scrollLeft: number } {
    const { rowCount, columnCount } = this.options
    const scrollTop = this.getPrefixRowSize(Math.min(row, rowCount - 1) - 1) + this.options.paddingStart
    const scrollLeft = this.getPrefixColumnSize(Math.min(column, columnCount - 1) - 1) + this.options.paddingStart

    this.scrollTop = scrollTop
    this.scrollLeft = scrollLeft

    this.scrollTopRestoration?.recordScrollPosition(scrollTop, "programmatic")
    this.scrollLeftRestoration?.recordScrollPosition(scrollLeft, "programmatic")

    return { scrollTop, scrollLeft }
  }

  /**
   * Scroll to specific row
   */
  scrollToRow(row: number): { scrollTop: number } {
    const { rowCount } = this.options
    const scrollTop = this.getPrefixRowSize(Math.min(row, rowCount - 1) - 1) + this.options.paddingStart
    this.scrollTop = scrollTop
    this.scrollTopRestoration?.recordScrollPosition(scrollTop, "programmatic")
    return { scrollTop }
  }

  /**
   * Scroll to specific column
   */
  scrollToColumn(column: number): { scrollLeft: number } {
    const { columnCount } = this.options
    const scrollLeft = this.getPrefixColumnSize(Math.min(column, columnCount - 1) - 1) + this.options.paddingStart
    this.scrollLeft = scrollLeft
    this.scrollLeftRestoration?.recordScrollPosition(scrollLeft, "programmatic")
    return { scrollLeft }
  }

  /**
   * Force recalculation
   */
  forceUpdate(): void {
    this.lastScrollTop = -1
    this.lastScrollLeft = -1
    this.calculateRange()
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<GridVirtualizerOptions>): void {
    const prevOptions = this.options

    this.options = { ...this.options, ...options } as ResolvedOptions

    if (this.options.rowCount !== prevOptions.rowCount || this.options.columnCount !== prevOptions.columnCount) {
      this.onItemsChanged()
    }

    const prevKey = prevOptions.scrollRestoration?.key
    const newKey = this.options.scrollRestoration?.key
    if (newKey && newKey !== prevKey) {
      this.scrollTopRestoration?.updateRestorationKey(`${newKey}-top`)
      this.scrollLeftRestoration?.updateRestorationKey(`${newKey}-left`)
    }

    this.forceUpdate()
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer)
    }
    this.detachScrollListener()
    this.sizeObserver?.destroy()
    this.scrollTopRestoration?.destroy()
    this.scrollLeftRestoration?.destroy()
  }

  /**
   * Restore scroll position from history
   */
  restoreScrollPosition(): { scrollTop: number; scrollLeft: number } | null {
    const top = this.scrollTopRestoration?.getRestorationPosition()
    const left = this.scrollLeftRestoration?.getRestorationPosition()

    if (!top && !left) return null

    const scrollTop = top?.offset ?? this.scrollTop
    const scrollLeft = left?.offset ?? this.scrollLeft

    this.scrollTop = scrollTop
    this.scrollLeft = scrollLeft

    this.scrollTopRestoration?.recordScrollPosition(scrollTop, "programmatic")
    this.scrollLeftRestoration?.recordScrollPosition(scrollLeft, "programmatic")

    return { scrollTop, scrollLeft }
  }

  /**
   * Get ARIA attributes for the grid container
   */
  getContainerAriaAttrs() {
    const { rowCount, columnCount } = this.options
    return {
      role: "grid" as const,
      "aria-rowcount": rowCount,
      "aria-colcount": columnCount,
    }
  }

  /**
   * Get ARIA attributes for a grid cell
   */
  getCellAriaAttrs(rowIndex: number, columnIndex: number) {
    return {
      role: "gridcell" as const,
      "aria-rowindex": rowIndex + 1,
      "aria-colindex": columnIndex + 1,
    }
  }
}
