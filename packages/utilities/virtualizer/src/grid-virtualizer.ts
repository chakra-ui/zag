import { resizeObserverBorderBox } from "@zag-js/dom-query"
import type { CSSProperties, GridVirtualizerOptions, Range, TimerId } from "./types"
import { CacheManager } from "./utils/cache-manager"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"
import { SizeTracker } from "./utils/size-tracker"

interface GridRange {
  startRow: number
  endRow: number
  startColumn: number
  endColumn: number
}

const SCROLL_END_DELAY_MS = 150

/** A virtual row containing its visible columns */
export interface VirtualRow {
  /** Row index */
  row: number
  /** Y position (top offset) */
  y: number
  /** Row height */
  height: number
  /** Visible columns in this row */
  columns: VirtualColumn[]
  /** Ref callback for measuring the row container's height */
  measureRow: (element: HTMLElement | null) => void
}

/** A virtual column within a row */
export interface VirtualColumn {
  /** Column index */
  column: number
  /** X position (left offset) */
  x: number
  /** Column width */
  width: number
}

type ResolvedOptions = Required<Omit<GridVirtualizerOptions, "onScroll" | "onRangeChange" | "onVisibilityChange">> &
  Pick<GridVirtualizerOptions, "onScroll" | "onRangeChange" | "onVisibilityChange">

/**
 * Row-first grid virtualizer.
 *
 * Virtualizes vertically by rows, horizontally by columns.
 * Measures row height from a row container (one measurement per row, not per cell).
 * Column widths are independent horizontal tracks.
 *
 * Consumer renders: rows → cells inside each row.
 * This reduces measurement overhead from O(rows*cols) to O(rows + cols).
 */
export class GridVirtualizer {
  private options: ResolvedOptions

  // Scroll state
  private scrollTop = 0
  private scrollLeft = 0
  private isScrolling = false
  private scrollEndTimer: TimerId | null = null

  // Viewport dimensions
  private viewportWidth = 0
  private viewportHeight = 0

  // Visible range
  private range: GridRange = { startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }
  private lastScrollTop = -1
  private lastScrollLeft = -1
  private rangeCache!: CacheManager<string, GridRange>

  // Size tracking — separate Fenwick trees for rows and columns
  private rowSizeTracker!: SizeTracker
  private columnSizeTracker!: SizeTracker

  // Row element tracking for measurement
  private rowElementsByIndex = new Map<number, Element>()
  private rowResizeCleanups = new Map<Element, VoidFunction>()

  // Scroll element
  private scrollElement: Element | Window | null = null

  /** Cached for {@link handleScroll} getter — stable `onScroll={virtualizer.handleScroll}`. */
  private scrollHandler?: (event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }) => void

  /** For useSyncExternalStore (React) — row/col/range/viewport updates. */
  private storeVersion = 0
  private storeListeners = new Set<VoidFunction>()

  // Auto-sizing cleanup
  private scrollElementResizeCleanup?: VoidFunction

  constructor(options: GridVirtualizerOptions) {
    this.options = {
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      initialOffset: 0,
      overscan: 3,
      horizontal: false,
      rtl: false,
      rootMargin: "50px",
      preserveScrollAnchor: true,
      observeScrollElementSize: false,
      ...options,
    } as ResolvedOptions

    if (options.initialSize) {
      this.viewportWidth = options.initialSize.width
      this.viewportHeight = options.initialSize.height
    }

    this.initializeMeasurements()
  }

  init(scrollElement: HTMLElement): void {
    this.scrollElement = scrollElement

    if (this.options.observeScrollElementSize) {
      this.observeScrollElementSize(scrollElement)
    }

    this.measure()
  }

  /** Class field — stable reference for `useSyncExternalStore(virtualizer.subscribe, …)`. */
  subscribe = (listener: VoidFunction): VoidFunction => {
    this.storeListeners.add(listener)
    return () => {
      this.storeListeners.delete(listener)
    }
  }

  /** Class field — stable reference for `useSyncExternalStore(…, virtualizer.getSnapshot, …)`. */
  getSnapshot = (): number => {
    return this.storeVersion
  }

  private notifyStore(): void {
    this.storeVersion++
    for (const listener of this.storeListeners) {
      listener()
    }
  }

  private observeScrollElementSize(element: HTMLElement): void {
    this.scrollElementResizeCleanup?.()

    let lastWidth = 0
    let lastHeight = 0

    this.scrollElementResizeCleanup = resizeObserverBorderBox.observe(element, (entry) => {
      const { borderBoxSize } = entry
      const box = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }

      const width = box.inlineSize
      const height = box.blockSize

      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width
        lastHeight = height
        this.setViewportSize(width, height)
      }
    })
  }

  private initializeMeasurements(): void {
    this.resetMeasurements()
  }

  private resetMeasurements(): void {
    const { rowCount, columnCount, gap } = this.options

    if (!this.rangeCache) {
      this.rangeCache = new CacheManager<string, GridRange>(100)
    }

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
    this.rowSizeTracker?.clearMeasurements()
    this.columnSizeTracker?.clearMeasurements()
    this.resetMeasurements()
  }

  private onRowMeasured(index: number, size: number): boolean {
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }

    const changed = this.rowSizeTracker.setMeasuredSize(index, size)
    if (changed) this.rangeCache?.clear()
    return changed
  }

  private onColumnMeasured(index: number, size: number): boolean {
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }

    const changed = this.columnSizeTracker.setMeasuredSize(index, size)
    if (changed) this.rangeCache?.clear()
    return changed
  }

  // ============================================
  // Size helpers
  // ============================================

  private getRowSize(rowIndex: number): number {
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }
    return this.rowSizeTracker.getSize(rowIndex)
  }

  private getColumnSize(columnIndex: number): number {
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }
    return this.columnSizeTracker.getSize(columnIndex)
  }

  private getPrefixRowSize(index: number): number {
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }
    return this.rowSizeTracker.getPrefixSum(index)
  }

  private getPrefixColumnSize(index: number): number {
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }
    return this.columnSizeTracker.getPrefixSum(index)
  }

  private findRowIndexAtOffset(targetOffset: number): number {
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }
    return this.rowSizeTracker.findIndexAtOffset(targetOffset, this.options.paddingStart)
  }

  private findColumnIndexAtOffset(targetOffset: number): number {
    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }
    return this.columnSizeTracker.findIndexAtOffset(targetOffset, this.options.paddingStart)
  }

  // ============================================
  // Range calculation
  // ============================================

  private calculateRange(): void {
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

    const cacheKey = `${this.scrollTop}:${this.scrollLeft}:${this.viewportHeight}:${this.viewportWidth}`
    const cached = this.rangeCache.get(cacheKey)
    if (cached) {
      this.range = cached
      this.lastScrollTop = this.scrollTop
      this.lastScrollLeft = this.scrollLeft
      return
    }

    const startRow = this.findRowIndexAtOffset(this.scrollTop)
    const endRow = this.findRowIndexAtOffset(this.scrollTop + this.viewportHeight)
    const startColumn = this.findColumnIndexAtOffset(this.scrollLeft)
    const endColumn = this.findColumnIndexAtOffset(this.scrollLeft + this.viewportWidth)

    const newRange: GridRange = {
      startRow: Math.max(0, startRow - overscan),
      endRow: Math.min(rowCount - 1, endRow + overscan),
      startColumn: Math.max(0, startColumn - overscan),
      endColumn: Math.min(columnCount - 1, endColumn + overscan),
    }

    if (
      this.range.startRow !== newRange.startRow ||
      this.range.endRow !== newRange.endRow ||
      this.range.startColumn !== newRange.startColumn ||
      this.range.endColumn !== newRange.endColumn
    ) {
      this.range = newRange
      this.options.onRangeChange?.({ startIndex: newRange.startRow, endIndex: newRange.endRow })
    }

    this.lastScrollTop = this.scrollTop
    this.lastScrollLeft = this.scrollLeft
    this.rangeCache.set(cacheKey, newRange)
  }

  // ============================================
  // Row-first API (primary)
  // ============================================

  /**
   * Get virtual rows with their visible columns.
   * This is the primary API — renders rows as containers, cells inside.
   * Measurement happens per row (one offsetHeight per row, not per cell).
   */
  getVirtualRows(): VirtualRow[] {
    this.calculateRange()

    const { startRow, endRow, startColumn, endColumn } = this.range
    const rows: VirtualRow[] = []

    // Build column info once — shared across all rows
    const columns: VirtualColumn[] = []
    for (let col = startColumn; col <= endColumn; col++) {
      columns.push({
        column: col,
        x: this.getPrefixColumnSize(col - 1) + this.options.paddingStart,
        width: this.getColumnSize(col),
      })
    }

    for (let row = startRow; row <= endRow; row++) {
      const y = this.getPrefixRowSize(row - 1) + this.options.paddingStart
      const height = this.getRowSize(row)

      rows.push({
        row,
        y,
        height,
        columns,
        measureRow: this.createMeasureRow(row),
      })
    }

    return rows
  }

  /**
   * Get style for a virtual row container.
   * The row is positioned absolutely with translate3d for GPU acceleration.
   */
  getRowStyle(virtualRow: VirtualRow): CSSProperties {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: virtualRow.height,
      transform: `translate3d(0, ${virtualRow.y}px, 0)`,
    }
  }

  /**
   * Get style for a cell within a row.
   * Cells are positioned absolutely within the row by their column x/width.
   */
  getCellStyleInRow(column: VirtualColumn): CSSProperties {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: column.width,
      height: "100%",
      transform: `translate3d(${column.x}px, 0, 0)`,
    }
  }

  /**
   * Create a measureRow ref callback for a row.
   * Measures the row container's height (one read per row, not per cell).
   */
  private createMeasureRow(rowIndex: number): (element: HTMLElement | null) => void {
    return (element: HTMLElement | null) => {
      const prevElement = this.rowElementsByIndex.get(rowIndex)

      if (prevElement && prevElement !== element) {
        const cleanup = this.rowResizeCleanups.get(prevElement)
        if (cleanup) {
          cleanup()
          this.rowResizeCleanups.delete(prevElement)
        }
        this.rowElementsByIndex.delete(rowIndex)
      }

      if (element) {
        this.rowElementsByIndex.set(rowIndex, element)

        // Sync measurement
        const size = element.offsetHeight
        if (size > 0) {
          this.onRowMeasured(rowIndex, size)
        }

        // ResizeObserver for future changes (skip during scroll)
        if (!this.isScrolling) {
          this.observeRowSize(element, rowIndex)
        }
      } else {
        this.rowElementsByIndex.delete(rowIndex)
      }
    }
  }

  private observeRowSize(element: Element, rowIndex: number): void {
    // Unobserve previous
    const prevCleanup = this.rowResizeCleanups.get(element)
    if (prevCleanup) {
      prevCleanup()
      this.rowResizeCleanups.delete(element)
    }

    const cleanup = resizeObserverBorderBox.observe(element, (entry) => {
      const { borderBoxSize } = entry
      const box = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }
      const size = box.blockSize
      if (this.onRowMeasured(rowIndex, size)) {
        this.forceUpdate()
      }
    })

    this.rowResizeCleanups.set(element, cleanup)
  }

  private observeUnobservedRows(): void {
    for (const [rowIndex, element] of this.rowElementsByIndex) {
      if (!this.rowResizeCleanups.has(element)) {
        this.observeRowSize(element, rowIndex)
      }
    }
  }

  // ============================================
  // Styles
  // ============================================

  getContainerStyle(): CSSProperties {
    return {
      position: "relative",
      overflow: "auto",
      willChange: "scroll-position",
      WebkitOverflowScrolling: "touch",
    }
  }

  getContentStyle(): CSSProperties {
    return {
      position: "relative",
      width: this.getTotalWidth(),
      height: this.getTotalHeight(),
      pointerEvents: this.isScrolling ? "none" : "auto",
    }
  }

  // ============================================
  // Scroll handling
  // ============================================

  get handleScroll(): (event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }) => void {
    if (!this.scrollHandler) {
      this.scrollHandler = (event) => {
        this.handleScrollEvent(event)
      }
    }
    return this.scrollHandler
  }

  private handleScrollEvent(event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }): void {
    const { scrollTop, scrollLeft } = getScrollPositionFromEvent(event)

    if (scrollTop === this.scrollTop && scrollLeft === this.scrollLeft) return

    this.scrollTop = scrollTop
    this.scrollLeft = scrollLeft
    this.isScrolling = true

    this.calculateRange()

    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer)
    this.scrollEndTimer = setTimeout(() => {
      this.scrollEndTimer = null
      this.isScrolling = false
      this.observeUnobservedRows()
      this.options.onScroll?.({
        offset: { x: this.scrollLeft, y: this.scrollTop },
        direction: {
          x:
            this.scrollLeft > this.lastScrollLeft
              ? "forward"
              : this.scrollLeft < this.lastScrollLeft
                ? "backward"
                : "idle",
          y:
            this.scrollTop > this.lastScrollTop ? "forward" : this.scrollTop < this.lastScrollTop ? "backward" : "idle",
        },
        isScrolling: false,
      })
      this.notifyStore()
    }, SCROLL_END_DELAY_MS)

    this.notifyStore()
  }

  getScrollHandler() {
    return this.handleScroll
  }

  // ============================================
  // Public API
  // ============================================

  setViewportSize(width: number, height: number): void {
    this.viewportWidth = width
    this.viewportHeight = height
    this.lastScrollTop = -1
    this.lastScrollLeft = -1
    this.calculateRange()
    this.notifyStore()
  }

  measure(): void {
    if (!this.scrollElement) return
    const rect = (this.scrollElement as Element).getBoundingClientRect()
    this.setViewportSize(rect.width, rect.height)
  }

  getTotalWidth(): number {
    const { columnCount, paddingStart, paddingEnd } = this.options
    if (columnCount === 0) return paddingStart + paddingEnd

    if (!this.columnSizeTracker) {
      this.columnSizeTracker = new SizeTracker(this.options.columnCount, this.options.gap, (i) =>
        this.options.estimatedColumnSize(i),
      )
    }

    return this.columnSizeTracker.getTotalSize(paddingStart, paddingEnd)
  }

  getTotalHeight(): number {
    const { rowCount, paddingStart, paddingEnd } = this.options
    if (rowCount === 0) return paddingStart + paddingEnd

    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }

    return this.rowSizeTracker.getTotalSize(paddingStart, paddingEnd)
  }

  getRange(): GridRange {
    return { ...this.range }
  }

  getVisibleRowRange(): Range {
    return { startIndex: this.range.startRow, endIndex: this.range.endRow }
  }

  getVisibleColumnRange(): Range {
    return { startIndex: this.range.startColumn, endIndex: this.range.endColumn }
  }

  scrollToCell(
    row: number,
    column: number,
    options: { behavior?: ScrollBehavior } = {},
  ): { scrollTop: number; scrollLeft: number } {
    const { rowCount, columnCount } = this.options
    const scrollTop = this.getPrefixRowSize(Math.min(row, rowCount - 1) - 1) + this.options.paddingStart
    const scrollLeft = this.getPrefixColumnSize(Math.min(column, columnCount - 1) - 1) + this.options.paddingStart
    const behavior = options.behavior ?? "auto"

    if (this.scrollElement && typeof (this.scrollElement as any).scrollTo === "function") {
      ;(this.scrollElement as any).scrollTo({ top: scrollTop, left: scrollLeft, behavior })
      if (behavior !== "smooth") {
        this.handleScroll({ currentTarget: { scrollTop, scrollLeft } })
      }
    } else {
      this.scrollTop = scrollTop
      this.scrollLeft = scrollLeft
      this.forceUpdate()
    }

    return { scrollTop, scrollLeft }
  }

  scrollToRow(row: number, options: { behavior?: ScrollBehavior } = {}): { scrollTop: number } {
    const { rowCount } = this.options
    const scrollTop = this.getPrefixRowSize(Math.min(row, rowCount - 1) - 1) + this.options.paddingStart
    const behavior = options.behavior ?? "auto"

    if (this.scrollElement && typeof (this.scrollElement as any).scrollTo === "function") {
      ;(this.scrollElement as any).scrollTo({ top: scrollTop, behavior })
      if (behavior !== "smooth") {
        this.handleScroll({ currentTarget: { scrollTop, scrollLeft: this.scrollLeft } })
      }
    } else {
      this.scrollTop = scrollTop
      this.forceUpdate()
    }
    return { scrollTop }
  }

  scrollToColumn(column: number, options: { behavior?: ScrollBehavior } = {}): { scrollLeft: number } {
    const { columnCount } = this.options
    const scrollLeft = this.getPrefixColumnSize(Math.min(column, columnCount - 1) - 1) + this.options.paddingStart
    const behavior = options.behavior ?? "auto"

    if (this.scrollElement && typeof (this.scrollElement as any).scrollTo === "function") {
      ;(this.scrollElement as any).scrollTo({ left: scrollLeft, behavior })
      if (behavior !== "smooth") {
        this.handleScroll({ currentTarget: { scrollTop: this.scrollTop, scrollLeft } })
      }
    } else {
      this.scrollLeft = scrollLeft
      this.forceUpdate()
    }
    return { scrollLeft }
  }

  /**
   * Manually measure a column width (e.g. from a header cell).
   */
  measureColumn(columnIndex: number, width: number): void {
    if (this.onColumnMeasured(columnIndex, width)) {
      this.forceUpdate()
    }
  }

  forceUpdate(): void {
    this.lastScrollTop = -1
    this.lastScrollLeft = -1
    this.calculateRange()
    this.notifyStore()
  }

  updateOptions(options: Partial<GridVirtualizerOptions>): void {
    const prevOptions = this.options
    this.options = { ...this.options, ...options } as ResolvedOptions

    if (this.options.rowCount !== prevOptions.rowCount || this.options.columnCount !== prevOptions.columnCount) {
      this.onItemsChanged()
    }

    this.forceUpdate()
  }

  destroy(): void {
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer)
    this.scrollElementResizeCleanup?.()

    for (const cleanup of this.rowResizeCleanups.values()) {
      cleanup()
    }
    this.rowResizeCleanups.clear()
    this.rowElementsByIndex.clear()
    this.storeListeners.clear()
  }

  // ============================================
  // ARIA
  // ============================================

  getContainerAriaAttrs() {
    const { rowCount, columnCount } = this.options
    return {
      role: "grid" as const,
      "aria-rowcount": rowCount,
      "aria-colcount": columnCount,
    }
  }

  getRowAriaAttrs(rowIndex: number) {
    return {
      role: "row" as const,
      "aria-rowindex": rowIndex + 1,
    }
  }

  getCellAriaAttrs(rowIndex: number, columnIndex: number) {
    return {
      role: "gridcell" as const,
      "aria-rowindex": rowIndex + 1,
      "aria-colindex": columnIndex + 1,
    }
  }
}
