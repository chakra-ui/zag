import { runIfFn } from "@zag-js/utils/functions"
import { isFunction, isNumber, isString } from "@zag-js/utils/guard"
import { addGlobalEvent, AnimationFrame, isHTMLElement, Timeout } from "@zag-js/dom-query"
import { resizeObserverBorderBox } from "@zag-js/dom-query/observe"
import type {
  CSSProperties,
  GridScrollToOptions,
  GridVirtualizerOptions,
  Range,
  RangeChangeReason,
  ScrollAlignment,
  ScrollState,
} from "./types"
import { createNormalizer, type NormalizeProps, type PropTypes } from "@zag-js/types"
import { isSameOption } from "./utils/options"
import { CacheManager } from "./utils/cache-manager"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"

const DIGITS_RE = /^\d+$/
import { SizeTracker } from "./utils/size-tracker"
import { partSelector, trackElements } from "./utils/track-elements"

interface GridRange {
  startRow: number
  endRow: number
  startColumn: number
  endColumn: number
}

const SCROLL_END_DELAY_MS = 150
const INITIAL_SCROLL_TOLERANCE = 1
type RtlScrollBehavior = "negative" | "positive-descending" | "positive-ascending"

type RangeChangeReasonDetails = { reason: RangeChangeReason }

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

type ResolvedOptions = Required<
  Omit<GridVirtualizerOptions, "onScroll" | "onScrollEnd" | "onRangeChange" | "onVisibilityChange">
> &
  Pick<GridVirtualizerOptions, "onScroll" | "onScrollEnd" | "onRangeChange" | "onVisibilityChange">

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
const alignOffset = (start: number, size: number, current: number, viewport: number, align: ScrollAlignment) => {
  let offset = current
  if (align === "start") offset = start
  else if (align === "end") offset = start + size - viewport
  else if (align === "center") offset = start - (viewport - size) / 2
  else if (start < current) offset = start
  else if (start + size > current + viewport) offset = start + size - viewport
  return Math.max(0, offset)
}

let uid = 0
const defaultNormalize = createNormalizer((props) => props)

export class GridVirtualizer<T extends PropTypes = PropTypes> {
  private options: ResolvedOptions

  /** Stamped on the elements the prop getters return */
  readonly id: string
  private normalize: NormalizeProps<T>
  private scrollCleanup: VoidFunction | undefined
  private trackCleanup: VoidFunction | undefined

  // Scroll state
  private scrollTop = 0
  private scrollLeft = 0
  private scrollDirectionX: ScrollState["direction"]["x"] = "idle"
  private scrollDirectionY: ScrollState["direction"]["y"] = "idle"
  private isScrolling = false
  private rtlScrollBehavior: RtlScrollBehavior | null = null
  private scrollEndTimeout = Timeout.create()

  // Viewport dimensions
  private viewportWidth = 0
  private viewportHeight = 0

  // Visible range
  private range: GridRange = {
    startRow: 0,
    endRow: -1,
    startColumn: 0,
    endColumn: -1,
  }
  private lastScrollTop = -1
  private lastScrollLeft = -1
  private lastScrollMargin = -1
  private rangeCache!: CacheManager<string, GridRange>

  // Size tracking — separate Fenwick trees for rows and columns
  private rowSizeTracker!: SizeTracker
  private columnSizeTracker!: SizeTracker

  // Row element tracking for measurement
  private rowElementsByIndex = new Map<number, Element>()
  private rowIndexByElement = new Map<Element, number>()
  private rowResizeCleanups = new Map<Element, VoidFunction>()
  private pendingRowSizeUpdates = new Map<number, { size: number; element: Element | undefined }>()
  private rowSizeUpdateFrame = AnimationFrame.create()
  // the key each row was measured under, so sizes follow their rows through sorts
  private rowKeys = new Map<number, string | number>()

  // Scroll element
  private scrollElement: Element | Window | null = null

  /** For useSyncExternalStore (React) — row/col/range/viewport updates. */
  private storeVersion = 0
  private storeListeners = new Set<VoidFunction>()
  private pendingSyncNotify = false

  // Auto-sizing cleanup
  private scrollElementResizeCleanup?: VoidFunction
  private initialOffsetFrame = AnimationFrame.create()
  private hasAppliedInitialOffset = false
  private isDestroyed = false

  constructor(options: GridVirtualizerOptions) {
    this.options = {
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      scrollMargin: 0,
      scrollPaddingStart: 0,
      scrollPaddingEnd: 0,
      initialOffset: 0,
      disableScrollOnInit: false,
      overscan: 3,
      rangeExtractor: (range) => {
        const indexes: number[] = []
        for (let i = range.startIndex; i <= range.endIndex; i++) indexes.push(i)
        return indexes
      },
      orientation: "vertical",
      dir: "ltr",
      rootMargin: "50px",
      preserveScrollAnchor: true,
      overflowAnchor: "none",
      observeScrollElementSize: false,
      scrollEndDelay: SCROLL_END_DELAY_MS,
      ...options,
    } as ResolvedOptions

    this.id = options.id ?? `grid-virtualizer-${++uid}`
    this.normalize = (options.normalizeProps ?? defaultNormalize) as NormalizeProps<T>
    this.scrollTop = this.options.initialOffset

    if (options.initialRect) {
      this.viewportWidth = options.initialRect.width
      this.viewportHeight = options.initialRect.height
    }

    this.initializeMeasurements()
    this.applyInitialMeasurements()
  }

  init(scrollElement: HTMLElement): void {
    // destroy() releases the size trackers, so rebuild them when the instance is reused
    const reused = this.isDestroyed
    if (reused) this.resetMeasurements()
    this.isDestroyed = false
    this.scrollElement = scrollElement
    this.rtlScrollBehavior = null
    this.listenToScroll(scrollElement)
    this.trackRows(scrollElement)

    if (this.options.observeScrollElementSize) {
      this.observeScrollElementSize(scrollElement)
    }

    this.measure()
    this.applyInitialScrollOffset()
    // measure() only notifies when a tracked row changed, so a reused instance needs its own
    if (reused) this.notifyStore()
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
    if (this.isDestroyed) return
    this.storeVersion++
    for (const listener of this.storeListeners) {
      listener()
    }
  }

  private getScrollMargin(): number {
    const { scrollMargin } = this.options
    return runIfFn(scrollMargin)
  }

  private get isRtl(): boolean {
    return this.options.dir === "rtl"
  }

  private getMaxHorizontalOffset(target: HTMLElement | null): number {
    if (!target) return 0
    const scrollWidth = Number(target.scrollWidth) || 0
    const clientWidth = Number(target.clientWidth) || 0
    return Math.max(0, scrollWidth - clientWidth)
  }

  private detectRtlScrollBehavior(target: HTMLElement): RtlScrollBehavior {
    const previous = target.scrollLeft
    const maxOffset = this.getMaxHorizontalOffset(target)
    if (maxOffset > 0 && Math.abs(previous - maxOffset) <= 1) {
      return "positive-descending"
    }

    target.scrollLeft = 0
    const atZero = target.scrollLeft
    if (atZero > 0) {
      target.scrollLeft = previous
      return "positive-descending"
    }

    target.scrollLeft = 1
    const atOne = target.scrollLeft
    target.scrollLeft = previous
    return atOne === 0 ? "negative" : "positive-ascending"
  }

  private resolveRtlScrollBehavior(target: HTMLElement | null): RtlScrollBehavior {
    if (this.rtlScrollBehavior) return this.rtlScrollBehavior
    if (!target) {
      this.rtlScrollBehavior = "positive-ascending"
      return this.rtlScrollBehavior
    }

    this.rtlScrollBehavior = this.detectRtlScrollBehavior(target)
    return this.rtlScrollBehavior
  }

  private toLogicalHorizontalOffset(rawOffset: number, target: HTMLElement | null): number {
    if (!this.isRtl) return rawOffset
    const mode = this.resolveRtlScrollBehavior(target)
    switch (mode) {
      case "negative":
        return -rawOffset
      case "positive-descending":
        return this.getMaxHorizontalOffset(target) - rawOffset
      default:
        return rawOffset
    }
  }

  private toRawHorizontalOffset(logicalOffset: number, target: HTMLElement | null): number {
    if (!this.isRtl) return logicalOffset
    const mode = this.resolveRtlScrollBehavior(target)
    switch (mode) {
      case "negative":
        return -logicalOffset
      case "positive-descending":
        return this.getMaxHorizontalOffset(target) - logicalOffset
      default:
        return logicalOffset
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

  private applyInitialMeasurements(): void {
    const seeds = this.options.initialMeasurements
    if (!seeds) return

    let changed = false

    const entries = seeds instanceof Map ? seeds.entries() : Object.entries(seeds)
    for (const [rawKey, rawSize] of entries) {
      const size = Number(rawSize)
      if (!Number.isFinite(size) || size <= 0) continue

      const rowIndex = this.resolveInitialMeasurementRow(rawKey)
      if (rowIndex === undefined) continue

      if (this.onRowMeasured(rowIndex, size)) {
        changed = true
      }
    }

    if (changed) {
      this.rangeCache?.clear()
      this.lastScrollTop = -1
      this.lastScrollLeft = -1
      this.lastScrollMargin = -1
    }
  }

  private resolveInitialMeasurementRow(key: string | number): number | undefined {
    const { rowCount } = this.options

    const byUser = this.options.keyToIndex?.(key)
    if (byUser !== undefined && byUser >= 0 && byUser < rowCount) {
      return byUser
    }

    if (isNumber(key) && Number.isInteger(key) && key >= 0 && key < rowCount) {
      return key
    }

    if (isString(key) && DIGITS_RE.test(key)) {
      const parsed = Number(key)
      if (parsed >= 0 && parsed < rowCount) {
        return parsed
      }
    }

    if (isFunction(this.options.indexToKey)) {
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        if (this.options.indexToKey(rowIndex) === key) {
          return rowIndex
        }
      }
    }

    return undefined
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

  private getRowKey(index: number): string | number {
    return isFunction(this.options.indexToKey) ? this.options.indexToKey(index) : index
  }

  // the rendered rows are enough to notice a reorder
  private hasReorderedRows(): boolean {
    if (!isFunction(this.options.indexToKey) || this.rowKeys.size === 0) return false
    const { startRow, endRow } = this.range
    for (let row = Math.max(0, startRow); row <= endRow; row++) {
      const key = this.rowKeys.get(row)
      if (key !== undefined && key !== this.getRowKey(row)) return true
    }
    return false
  }

  // by key when rows have keys, else by index; estimates are read again
  private remapRows(): void {
    const { rowCount } = this.options
    if (!this.rowSizeTracker) return

    if (!isFunction(this.options.indexToKey) || this.rowKeys.size === 0) {
      this.rowSizeTracker.remap(rowCount, (index) => index)
      return
    }

    const nextIndexByKey = this.findRowIndexes(new Set(this.rowKeys.values()))
    this.rowSizeTracker.remap(rowCount, (index) => {
      const key = this.rowKeys.get(index)
      return key === undefined ? undefined : nextIndexByKey.get(key)
    })

    this.rowKeys = new Map()
    for (const [key, index] of nextIndexByKey) this.rowKeys.set(index, key)
  }

  private findRowIndexes(keys: Set<string | number>): Map<string | number, number> {
    const indexes = new Map<string | number, number>()
    const { keyToIndex, rowCount } = this.options

    if (keyToIndex) {
      for (const key of keys) {
        const index = keyToIndex(key)
        if (index !== undefined && index >= 0 && index < rowCount) indexes.set(key, index)
      }
      return indexes
    }

    // one pass over the rows, not one per key
    for (let index = 0; index < rowCount && indexes.size < keys.size; index++) {
      const key = this.getRowKey(index)
      if (keys.has(key)) indexes.set(key, index)
    }
    return indexes
  }

  // a row measured above the view would move it; the scroll moves by the same amount
  private keepRowsInViewStill(measure: () => boolean): boolean {
    const element = this.scrollElement
    if (!this.options.preserveScrollAnchor || !isHTMLElement(element) || this.options.rowCount === 0) {
      return measure()
    }

    const anchorRow = this.findRowIndexAtOffset(this.scrollTop + this.getScrollMargin())
    const anchorStart = this.getPrefixRowSize(anchorRow - 1)
    if (!measure()) return false

    const delta = this.getPrefixRowSize(anchorRow - 1) - anchorStart
    if (delta === 0) return true

    // set the height now; a scroll written before the next render is clamped to the old one
    const content = element.querySelector<HTMLElement>(partSelector("content", this.id))
    if (content) content.style.height = `${this.getTotalHeight()}px`
    element.scrollTop += delta
    this.scrollTop += delta
    return true
  }

  private onRowMeasured(index: number, size: number): boolean {
    if (!this.rowSizeTracker) {
      this.rowSizeTracker = new SizeTracker(this.options.rowCount, this.options.gap, (i) =>
        this.options.estimatedRowSize(i),
      )
    }

    if (isFunction(this.options.indexToKey)) this.rowKeys.set(index, this.getRowKey(index))
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

  private readMeasuredRowSize(element: HTMLElement, rowIndex: number): number {
    const measured = this.options.measureElement?.(element, {
      index: rowIndex,
      orientation: "vertical",
    })
    if (isNumber(measured) && Number.isFinite(measured) && measured > 0) {
      return measured
    }
    return element.offsetHeight
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

  private calculateRange({ reason }: RangeChangeReasonDetails = { reason: "manual" }): void {
    if (this.isDestroyed) return
    const scrollMargin = this.getScrollMargin()

    if (
      this.lastScrollTop === this.scrollTop &&
      this.lastScrollLeft === this.scrollLeft &&
      this.lastScrollMargin === scrollMargin
    ) {
      return
    }

    const { rowCount, columnCount, overscan } = this.options

    if (rowCount === 0 || columnCount === 0 || this.viewportHeight === 0 || this.viewportWidth === 0) {
      this.range = { startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }
      this.lastScrollTop = this.scrollTop
      this.lastScrollLeft = this.scrollLeft
      this.lastScrollMargin = scrollMargin
      return
    }

    const viewportTop = this.scrollTop + scrollMargin
    const cacheKey = `${viewportTop}:${this.scrollLeft}:${this.viewportHeight}:${this.viewportWidth}`
    const cached = this.rangeCache.get(cacheKey)
    if (cached) {
      this.range = cached
      this.lastScrollTop = this.scrollTop
      this.lastScrollLeft = this.scrollLeft
      this.lastScrollMargin = scrollMargin
      return
    }

    const startRow = this.findRowIndexAtOffset(viewportTop)
    const endRow = this.findRowIndexAtOffset(viewportTop + this.viewportHeight)
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
      this.options.onRangeChange?.({
        range: { startIndex: newRange.startRow, endIndex: newRange.endRow },
        reason,
      })
    }

    this.lastScrollTop = this.scrollTop
    this.lastScrollLeft = this.scrollLeft
    this.lastScrollMargin = scrollMargin
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
    const scrollMargin = this.getScrollMargin()

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
      const y = this.getPrefixRowSize(row - 1) + this.options.paddingStart - scrollMargin
      const height = this.getRowSize(row)

      rows.push({
        row,
        y,
        height,
        columns,
      })
    }

    return rows
  }

  /**
   * Get style for a virtual row container.
   * The row is positioned absolutely with translate3d for GPU acceleration.
   */
  private getRowStyle(virtualRow: VirtualRow): CSSProperties {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: `${virtualRow.height}px`,
      transform: `translate3d(0, ${virtualRow.y}px, 0)`,
    }
  }

  /**
   * Get style for a cell within a row.
   * Cells are positioned absolutely within the row by their column x/width.
   */
  private getCellStyle(column: VirtualColumn): CSSProperties {
    const x = this.isRtl ? -column.x : column.x
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: `${column.width}px`,
      height: "100%",
      transform: `translate3d(${x}px, 0, 0)`,
    }
  }

  /**
   * Create a measureRow ref callback for a row.
   * Measures the row container's height (one read per row, not per cell).
   */
  private listenToScroll(element: HTMLElement): void {
    this.scrollCleanup?.()
    if (!isHTMLElement(element)) return
    const onScroll = (event: Event) => this.handleScrollEvent(event)
    this.scrollCleanup = addGlobalEvent(element, "scroll", onScroll, { passive: true })
  }

  private trackRows(root: HTMLElement): void {
    this.trackCleanup?.()
    const attach = (element: HTMLElement) => {
      const index = Number(element.dataset.index)
      if (Number.isInteger(index)) this.attachRowElement(index, element)
    }
    const detach = (element: HTMLElement) => {
      const index = this.rowIndexByElement.get(element)
      if (index !== undefined) this.detachRowElement(index, element)
    }
    this.trackCleanup = trackElements(root, {
      selector: partSelector("row", this.id),
      onAdd: attach,
      onRemove: detach,
      onIndexChange: (element) => {
        detach(element)
        attach(element)
      },
    })
  }

  private attachRowElement(rowIndex: number, element: HTMLElement): void {
    const prevElement = this.rowElementsByIndex.get(rowIndex)
    if (prevElement && prevElement !== element) this.detachRowElement(rowIndex, prevElement)

    this.rowElementsByIndex.set(rowIndex, element)
    this.rowIndexByElement.set(element, rowIndex)
    const size = this.readMeasuredRowSize(element, rowIndex)
    if (size > 0) this.measureRowSync(rowIndex, size)

    // Skipped during scroll; rows mounted then are observed once it ends
    if (!this.isScrolling) this.observeRowSize(element, rowIndex)
  }

  private detachRowElement(rowIndex: number, element: Element): void {
    if (this.rowElementsByIndex.get(rowIndex) === element) this.rowElementsByIndex.delete(rowIndex)
    this.rowIndexByElement.delete(element)
    this.rowResizeCleanups.get(element)?.()
    this.rowResizeCleanups.delete(element)
  }

  private measureRowSync(rowIndex: number, size: number): void {
    const changed = this.keepRowsInViewStill(() => this.onRowMeasured(rowIndex, size))
    if (!changed) return

    // Notify also while scrolling, so rows mounted mid-scroll don't paint at estimated positions
    if (!this.pendingSyncNotify) {
      this.pendingSyncNotify = true
      queueMicrotask(() => {
        this.pendingSyncNotify = false
        if (this.isDestroyed) return
        this.forceUpdate({ reason: "measurement" })
      })
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
      if (this.rowElementsByIndex.get(rowIndex) !== entry.target) return

      const { borderBoxSize } = entry
      const box = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }
      const size = box.blockSize
      this.scheduleRowSizeUpdate(rowIndex, size, entry.target)
    })

    this.rowResizeCleanups.set(element, cleanup)
  }

  private scheduleRowSizeUpdate(rowIndex: number, size: number, element?: Element): void {
    if (this.isDestroyed) return

    this.pendingRowSizeUpdates.set(rowIndex, { size, element })

    if (!this.rowSizeUpdateFrame.isActive()) {
      this.rowSizeUpdateFrame.request(() => {
        this.flushRowSizeUpdates()
      })
    }
  }

  private flushRowSizeUpdates(): void {
    if (this.isDestroyed) {
      this.pendingRowSizeUpdates.clear()
      return
    }

    if (this.pendingRowSizeUpdates.size === 0) return

    const updates = [...this.pendingRowSizeUpdates]
    this.pendingRowSizeUpdates.clear()

    const changed = this.keepRowsInViewStill(() => {
      let anyChanged = false
      for (const [rowIndex, { size, element }] of updates) {
        if (element && this.rowElementsByIndex.get(rowIndex) !== element) continue
        if (this.onRowMeasured(rowIndex, size)) anyChanged = true
      }
      return anyChanged
    })

    if (changed) {
      this.forceUpdate({ reason: "measurement" })
    }
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

  /** Props for the scroll container. Attach the container with `init(element)`. */
  getRootProps(): T["element"] {
    const { rowCount, columnCount } = this.options
    return this.normalize.element({
      "data-virtualizer-root": this.id,
      "data-empty": rowCount === 0 || columnCount === 0 ? "" : undefined,
      tabIndex: 0,
      role: "grid",
      "aria-rowcount": rowCount,
      "aria-colcount": columnCount,
      style: {
        position: "relative",
        overflow: "auto",
        overflowAnchor: this.options.overflowAnchor,
        "--total-size": `${this.getTotalHeight()}px`,
      },
    })
  }

  /** Props for the element sized to the whole grid, which holds the rendered rows */
  getContentProps(): T["element"] {
    return this.normalize.element({
      "data-virtualizer-content": this.id,
      style: this.getContentStyle(),
    })
  }

  /** Props for a rendered row. Positions it and measures its height. */
  getRowProps(virtualRow: VirtualRow): T["element"] {
    return this.normalize.element({
      "data-virtualizer-row": this.id,
      "data-index": virtualRow.row,
      role: "row",
      "aria-rowindex": virtualRow.row + 1,
      style: this.getRowStyle(virtualRow),
    })
  }

  /** Props for a cell, positioned within its row */
  getCellProps(virtualRow: VirtualRow, column: VirtualColumn): T["element"] {
    return this.normalize.element({
      role: "gridcell",
      "aria-colindex": column.column + 1,
      "data-row": virtualRow.row,
      "data-column": column.column,
      style: this.getCellStyle(column),
    })
  }

  private getContentStyle(): CSSProperties {
    return {
      position: "relative",
      flexShrink: 0,
      width: `${this.getTotalWidth()}px`,
      height: `${this.getTotalHeight()}px`,
      pointerEvents: this.isScrolling ? "none" : "auto",
    }
  }

  // ============================================
  // Scroll handling
  // ============================================

  private handleScrollEvent(event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }): void {
    if (this.isDestroyed) return
    const { scrollTop, scrollLeft } = getScrollPositionFromEvent(event)
    const eventTarget =
      "currentTarget" in event &&
      event.currentTarget &&
      isNumber((event.currentTarget as { scrollLeft?: unknown }).scrollLeft)
        ? (event.currentTarget as HTMLElement)
        : null
    const nextLogicalLeft = this.toLogicalHorizontalOffset(scrollLeft, eventTarget)

    if (scrollTop === this.scrollTop && nextLogicalLeft === this.scrollLeft) return

    this.scrollDirectionX =
      nextLogicalLeft > this.scrollLeft ? "forward" : nextLogicalLeft < this.scrollLeft ? "backward" : "idle"
    this.scrollDirectionY = scrollTop > this.scrollTop ? "forward" : scrollTop < this.scrollTop ? "backward" : "idle"
    this.scrollTop = scrollTop
    this.scrollLeft = nextLogicalLeft
    this.isScrolling = true

    this.calculateRange({ reason: "scroll" })

    this.scrollEndTimeout.start(this.options.scrollEndDelay, () => {
      if (this.isDestroyed) return
      this.isScrolling = false
      this.observeUnobservedRows()
      this.options.onScroll?.(this.getScrollState())
      this.options.onScrollEnd?.(this.getScrollState())
      this.notifyStore()
    })

    this.notifyStore()
  }

  // ============================================
  // Public API
  // ============================================

  setViewportSize(width: number, height: number): void {
    if (this.isDestroyed) return
    this.viewportWidth = width
    this.viewportHeight = height
    this.lastScrollTop = -1
    this.lastScrollLeft = -1
    this.lastScrollMargin = -1
    this.calculateRange({ reason: "resize" })
    this.notifyStore()
  }

  measure(): void {
    if (this.isDestroyed) return
    if (!this.scrollElement) return
    const rect = (this.scrollElement as Element).getBoundingClientRect()
    this.setViewportSize(rect.width, rect.height)

    if (this.remeasureTrackedRows()) {
      this.lastScrollTop = -1
      this.lastScrollLeft = -1
      this.calculateRange({ reason: "measurement" })
      this.notifyStore()
    }
  }

  private applyInitialScrollOffset(): void {
    if (this.hasAppliedInitialOffset || this.options.disableScrollOnInit) return

    this.hasAppliedInitialOffset = true

    const targetOffset = this.options.initialOffset
    if (targetOffset <= 0 || !this.scrollElement) return

    this.writeInitialScrollOffset(targetOffset)

    if (typeof requestAnimationFrame === "undefined") return
    const appliedOffset = (this.scrollElement as HTMLElement).scrollTop
    if (Math.abs(appliedOffset - targetOffset) < INITIAL_SCROLL_TOLERANCE) return

    this.initialOffsetFrame.request(() => {
      if (this.isDestroyed || this.options.disableScrollOnInit) return
      this.writeInitialScrollOffset(targetOffset)
    })
  }

  private writeInitialScrollOffset(targetOffset: number): void {
    const element = this.scrollElement as HTMLElement | null
    if (!element) return

    const rawScrollLeft = this.toRawHorizontalOffset(this.scrollLeft, element)
    if (isFunction(element.scrollTo)) {
      element.scrollTo({ top: targetOffset, left: rawScrollLeft })
    } else {
      element.scrollTop = targetOffset
      element.scrollLeft = rawScrollLeft
    }
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
    return {
      startIndex: this.range.startColumn,
      endIndex: this.range.endColumn,
    }
  }

  scrollToCell(
    row: number,
    column: number,
    options: GridScrollToOptions = {},
  ): { scrollTop: number; scrollLeft: number } {
    const scrollTop = this.resolveRowOffset(row, options.align)
    const scrollLeft = this.resolveColumnOffset(column, options.align)
    this.scrollToPosition(scrollTop, scrollLeft, options.behavior)
    return { scrollTop, scrollLeft }
  }

  scrollToRow(row: number, options: GridScrollToOptions = {}): { scrollTop: number } {
    const scrollTop = this.resolveRowOffset(row, options.align)
    this.scrollToPosition(scrollTop, this.scrollLeft, options.behavior)
    return { scrollTop }
  }

  scrollToColumn(column: number, options: GridScrollToOptions = {}): { scrollLeft: number } {
    const scrollLeft = this.resolveColumnOffset(column, options.align)
    this.scrollToPosition(this.scrollTop, scrollLeft, options.behavior)
    return { scrollLeft }
  }

  private resolveRowOffset(row: number, align: ScrollAlignment = "auto"): number {
    const index = Math.min(row, this.options.rowCount - 1)
    const start = this.getPrefixRowSize(index - 1) + this.options.paddingStart - this.getScrollMargin()
    const viewport = this.getClientSize().height || this.viewportHeight
    return alignOffset(start, this.getRowSize(index), this.scrollTop, viewport, align)
  }

  private resolveColumnOffset(column: number, align: ScrollAlignment = "auto"): number {
    const index = Math.min(column, this.options.columnCount - 1)
    const start = this.getPrefixColumnSize(index - 1) + this.options.paddingStart
    const viewport = this.getClientSize().width || this.viewportWidth
    return alignOffset(start, this.getColumnSize(index), this.scrollLeft, viewport, align)
  }

  private getClientSize(): { width: number; height: number } {
    const element = this.scrollElement
    if (!element || !("clientHeight" in element)) return { width: 0, height: 0 }
    return { width: element.clientWidth, height: element.clientHeight }
  }

  private scrollToPosition(scrollTop: number, scrollLeft: number, behavior: ScrollBehavior = "auto"): void {
    const element = this.scrollElement
    if (element && isFunction(element.scrollTo)) {
      const hasScrollLeft = isNumber((element as { scrollLeft?: unknown }).scrollLeft)
      const left = hasScrollLeft ? this.toRawHorizontalOffset(scrollLeft, element as HTMLElement) : scrollLeft
      element.scrollTo({ top: scrollTop, left, behavior })
      if (behavior !== "smooth") this.handleScrollEvent({ currentTarget: { scrollTop, scrollLeft } })
      return
    }
    this.scrollTop = scrollTop
    this.scrollLeft = scrollLeft
    this.forceUpdate({ reason: "manual" })
  }

  /**
   * Manually measure a column width (e.g. from a header cell).
   */
  measureColumn(columnIndex: number, width: number): void {
    if (this.onColumnMeasured(columnIndex, width)) {
      this.forceUpdate({ reason: "measurement" })
    }
  }

  forceUpdate({ reason }: RangeChangeReasonDetails = { reason: "manual" }): void {
    if (this.isDestroyed) return
    this.lastScrollTop = -1
    this.lastScrollLeft = -1
    this.lastScrollMargin = -1
    this.rangeCache.clear()
    this.calculateRange({ reason })
    this.notifyStore()
  }

  getScrollState(): ScrollState {
    return {
      offset: { x: this.scrollLeft, y: this.scrollTop },
      direction: { x: this.scrollDirectionX, y: this.scrollDirectionY },
      isScrolling: this.isScrolling,
    }
  }

  private remeasureTrackedRows(): boolean {
    let changed = false

    for (const [rowIndex, element] of this.rowElementsByIndex) {
      if (rowIndex < 0 || rowIndex >= this.options.rowCount) continue

      const size = this.readMeasuredRowSize(element as HTMLElement, rowIndex)
      if (size > 0 && this.onRowMeasured(rowIndex, size)) {
        changed = true
      }
    }

    return changed
  }

  updateOptions(options: Partial<GridVirtualizerOptions>): void {
    if (this.isDestroyed) return
    const prevOptions = this.options
    this.options = { ...this.options, ...options } as ResolvedOptions
    const changed = Object.keys(options).some(
      (key) => !isSameOption(prevOptions[key as keyof ResolvedOptions], this.options[key as keyof ResolvedOptions]),
    )
    const rowsChanged = this.options.rowCount !== prevOptions.rowCount
    const columnsChanged = this.options.columnCount !== prevOptions.columnCount
    // a sort keeps the count and reuses the callbacks, so only the row keys show it
    const rowKeysMoved = this.hasReorderedRows()
    const reordered = !rowsChanged && rowKeysMoved
    if (!changed && !reordered) return
    if (options.dir !== undefined) {
      this.rtlScrollBehavior = null
    }

    if (rowsChanged || reordered) this.remapRows()
    if (columnsChanged) this.columnSizeTracker?.reindex(0, this.options.columnCount)
    if (rowsChanged || columnsChanged || reordered) {
      this.rangeCache?.clear()
      // rendered rows may still show the old order, so re-read them only when they kept their keys
      if (!rowKeysMoved) this.remeasureTrackedRows()
    }

    const reason: RangeChangeReason = rowsChanged || columnsChanged ? "count" : "manual"

    this.forceUpdate({ reason })
  }

  destroy(): void {
    this.isDestroyed = true
    this.pendingSyncNotify = false
    this.scrollElement = null
    this.rtlScrollBehavior = null
    this.scrollCleanup?.()
    this.trackCleanup?.()
    this.scrollCleanup = undefined
    this.trackCleanup = undefined

    this.scrollEndTimeout.cancel()
    this.initialOffsetFrame.cancel()
    this.rowSizeUpdateFrame.cancel()
    this.scrollElementResizeCleanup?.()
    delete this.scrollElementResizeCleanup

    for (const cleanup of this.rowResizeCleanups.values()) {
      cleanup()
    }
    this.rowResizeCleanups.clear()
    this.pendingRowSizeUpdates.clear()
    this.rowElementsByIndex.clear()
    this.rowIndexByElement.clear()
    this.rangeCache.clear()
    this.rowSizeTracker.reset(0)
    this.columnSizeTracker.reset(0)
    this.rowKeys.clear()
    this.storeListeners.clear()
  }
}
