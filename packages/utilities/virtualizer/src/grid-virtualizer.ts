import type { CSSProperties, GridVirtualizerOptions, OverscanConfig, Range, VirtualCell } from "./types"
import { SizeObserver } from "./utils/size-observer"
import { FenwickTree } from "./utils/fenwick-tree"
import { ScrollRestorationManager } from "./utils/scroll-restoration-manager"
import { resolveOverscanConfig, SCROLL_END_DELAY_MS } from "./utils/overscan"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"

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
    | "onPerfMetrics"
    | "onContainerResize"
    | "getScrollingEl"
    | "overscan"
    | "scrollRestoration"
  >
> &
  Pick<
    GridVirtualizerOptions,
    | "onScroll"
    | "onRangeChange"
    | "onHorizontalScroll"
    | "onVisibilityChange"
    | "onPerfMetrics"
    | "onContainerResize"
    | "getScrollingEl"
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

  // Viewport dimensions
  private viewportWidth = 0
  private viewportHeight = 0

  // Visible range
  private range: GridRange = { startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }
  private lastScrollTop = -1
  private lastScrollLeft = -1

  // Measurement caches
  private measuredRowSizes: Map<number, number> = new Map()
  private measuredColumnSizes: Map<number, number> = new Map()
  private rowFenwick: FenwickTree | null = null
  private columnFenwick: FenwickTree | null = null
  private rowSizeCache: Float64Array | null = null
  private columnSizeCache: Float64Array | null = null

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
      enableViewRecycling: false,
      preserveScrollAnchor: true,
      enablePerfMonitoring: false,
      enableAutoSizing: false,
      enableDOMOrderOptimization: false,
      domReorderDelay: 50,
      ...options,
      overscan,
    } as ResolvedOptions

    if (options.initialSize) {
      this.viewportWidth = options.initialSize.width
      this.viewportHeight = options.initialSize.height
    }

    this.initializeMeasurements()
    this.initializeAutoSizing()
    this.initializeScrollRestoration()
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

    this.measuredRowSizes.clear()
    this.rowFenwick = new FenwickTree(rowCount)
    this.rowSizeCache = new Float64Array(rowCount)
    for (let i = 0; i < rowCount; i++) {
      const size = this.getRowSize(i)
      this.rowSizeCache[i] = size
      this.rowFenwick.add(i, size + (i < rowCount - 1 ? gap : 0))
    }

    this.measuredColumnSizes.clear()
    this.columnFenwick = new FenwickTree(columnCount)
    this.columnSizeCache = new Float64Array(columnCount)
    for (let i = 0; i < columnCount; i++) {
      const size = this.getColumnSize(i)
      this.columnSizeCache[i] = size
      this.columnFenwick.add(i, size + (i < columnCount - 1 ? gap : 0))
    }
  }

  private onItemsChanged(): void {
    this.resetMeasurements()
  }

  private onRowMeasured(index: number, size: number): boolean {
    const currentSize = this.getRowSize(index)
    if (size <= currentSize) return false

    this.measuredRowSizes.set(index, size)

    if (!this.rowFenwick || !this.rowSizeCache) return true

    const delta = size - this.rowSizeCache[index]
    this.rowSizeCache[index] = size

    if (delta !== 0) {
      this.rowFenwick.add(index, delta)
    }

    return true
  }

  private onColumnMeasured(index: number, size: number): boolean {
    const currentSize = this.getColumnSize(index)
    if (size <= currentSize) return false

    this.measuredColumnSizes.set(index, size)

    if (!this.columnFenwick || !this.columnSizeCache) return true

    const delta = size - this.columnSizeCache[index]
    this.columnSizeCache[index] = size

    if (delta !== 0) {
      this.columnFenwick.add(index, delta)
    }

    return true
  }

  /**
   * Initialize auto-sizing if enabled
   */
  private initializeAutoSizing(): void {
    if (!this.options.enableAutoSizing) return

    this.sizeObserver = new SizeObserver({
      onResize: (size) => {
        this.setViewportSize(size.width, size.height)
        this.options.onContainerResize?.(size)
        this.scrollTopRestoration?.handleResize(this.scrollTop)
        this.scrollLeftRestoration?.handleResize(this.scrollLeft)
      },
    })

    // Auto-observe scrolling element if getScrollingEl is provided
    this.initializeScrollingElement()
  }

  /**
   * Resolve and cache the scroll element
   */
  private resolveScrollElement(): Element | Window | null {
    if (this.scrollElement) return this.scrollElement
    this.scrollElement = this.options.getScrollingEl?.() ?? null
    return this.scrollElement
  }

  /**
   * Initialize scrolling element observation
   */
  private initializeScrollingElement(): void {
    if (!this.sizeObserver) return

    const scrollEl = this.resolveScrollElement()
    if (scrollEl && scrollEl !== window) {
      this.sizeObserver.observe(scrollEl as Element)
    }
  }

  /**
   * Get estimated row size for a specific row
   */
  private getRowSize(rowIndex: number): number {
    const measuredSize = this.measuredRowSizes?.get(rowIndex)
    if (measuredSize !== undefined) return measuredSize
    if (this.rowSizeCache && rowIndex < this.rowSizeCache.length && this.rowSizeCache[rowIndex] > 0) {
      return this.rowSizeCache[rowIndex]
    }
    return this.options.estimatedRowSize(rowIndex)
  }

  /**
   * Get estimated column size for a specific column
   */
  private getColumnSize(columnIndex: number): number {
    const measuredSize = this.measuredColumnSizes?.get(columnIndex)
    if (measuredSize !== undefined) return measuredSize
    if (this.columnSizeCache && columnIndex < this.columnSizeCache.length && this.columnSizeCache[columnIndex] > 0) {
      return this.columnSizeCache[columnIndex]
    }
    return this.options.estimatedColumnSize(columnIndex)
  }

  private getPrefixRowSize(index: number): number {
    return this.rowFenwick?.prefixSumWithGap(index, this.options.gap) ?? 0
  }

  private getPrefixColumnSize(index: number): number {
    return this.columnFenwick?.prefixSumWithGap(index, this.options.gap) ?? 0
  }

  private findRowIndexAtOffset(offset: number): number {
    return this.rowFenwick?.lowerBoundWithPadding(offset, this.options.paddingStart) ?? 0
  }

  private findColumnIndexAtOffset(offset: number): number {
    return this.columnFenwick?.lowerBoundWithPadding(offset, this.options.paddingStart) ?? 0
  }

  /**
   * Calculate visible range based on scroll position
   */
  private calculateRange(): void {
    // Skip if already calculated for this scroll position
    if (this.lastScrollTop === this.scrollTop && this.lastScrollLeft === this.scrollLeft) {
      return
    }

    this.attachScrollListener()

    const { rowCount, columnCount, overscan } = this.options

    if (rowCount === 0 || columnCount === 0 || this.viewportHeight === 0 || this.viewportWidth === 0) {
      this.range = { startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }
      this.lastScrollTop = this.scrollTop
      this.lastScrollLeft = this.scrollLeft
      return
    }

    // Find visible rows
    const startRow = this.findRowIndexAtOffset(this.scrollTop)
    const endRow = this.findRowIndexAtOffset(this.scrollTop + this.viewportHeight)

    // Find visible columns
    const startColumn = this.findColumnIndexAtOffset(this.scrollLeft)
    const endColumn = this.findColumnIndexAtOffset(this.scrollLeft + this.viewportWidth)

    // Apply overscan
    const newRange: GridRange = {
      startRow: Math.max(0, startRow - overscan.count),
      endRow: Math.min(rowCount - 1, endRow + overscan.count),
      startColumn: Math.max(0, startColumn - overscan.count),
      endColumn: Math.min(columnCount - 1, endColumn + overscan.count),
    }

    const rangeChanged =
      newRange.startRow !== this.range.startRow ||
      newRange.endRow !== this.range.endRow ||
      newRange.startColumn !== this.range.startColumn ||
      newRange.endColumn !== this.range.endColumn

    this.range = newRange
    this.lastScrollTop = this.scrollTop
    this.lastScrollLeft = this.scrollLeft

    if (rangeChanged) {
      this.options.onRangeChange?.({ startIndex: newRange.startRow, endIndex: newRange.endRow })
    }
  }

  /**
   * Get all virtual cells that should be rendered
   */
  getVirtualCells(): VirtualCell[] {
    this.calculateRange()

    const { startRow, endRow, startColumn, endColumn } = this.range
    const cells: VirtualCell[] = []

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColumn; col <= endColumn; col++) {
        cells.push({
          row,
          column: col,
          x: this.getPrefixColumnSize(col - 1) + this.options.paddingStart,
          y: this.getPrefixRowSize(row - 1) + this.options.paddingStart,
          width: this.getColumnSize(col),
          height: this.getRowSize(row),
          measureElement: (el: HTMLElement | null) => {
            if (el) this.measureCell(el, row, col)
          },
        })
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
    const scrollLeftChanged = this.scrollLeft !== scrollLeft
    this.scrollTop = scrollTop
    this.scrollLeft = scrollLeft
    this.isScrolling = true

    this.calculateRange()

    if (scrollLeftChanged) {
      this.options.onHorizontalScroll?.(scrollLeft)
    }

    // Clear existing timer
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer)
    }

    // Set scroll end timer
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false
      this.scrollTopRestoration?.recordScrollPosition(this.scrollTop, "user")
      this.scrollLeftRestoration?.recordScrollPosition(this.scrollLeft, "user")
    }, SCROLL_END_DELAY_MS)
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

    const scrollEl = this.resolveScrollElement() ?? window
    this.scrollElement = scrollEl
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
    const scrollEl = this.resolveScrollElement()
    if (!scrollEl || scrollEl === window) return

    const rect = (scrollEl as Element).getBoundingClientRect()
    this.setViewportSize(rect.width, rect.height)
  }

  /**
   * Get total width
   */
  getTotalWidth(): number {
    const { columnCount, paddingStart, paddingEnd } = this.options
    if (columnCount === 0) return paddingStart + paddingEnd
    const lastItemStart = this.getPrefixColumnSize(columnCount - 1)
    const lastItemSize = this.getColumnSize(columnCount - 1)
    return paddingStart + lastItemStart + lastItemSize + paddingEnd
  }

  /**
   * Get total height
   */
  getTotalHeight(): number {
    const { rowCount, paddingStart, paddingEnd } = this.options
    if (rowCount === 0) return paddingStart + paddingEnd
    const lastItemStart = this.getPrefixRowSize(rowCount - 1)
    const lastItemSize = this.getRowSize(rowCount - 1)
    return paddingStart + lastItemStart + lastItemSize + paddingEnd
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
