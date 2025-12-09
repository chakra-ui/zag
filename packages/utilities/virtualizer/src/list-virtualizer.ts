import type { CSSProperties, ItemState, ListVirtualizerOptions, Range, VirtualItem } from "./types"
import { FenwickTree } from "./utils/fenwick-tree"
import { Virtualizer } from "./virtualizer"

/**
 * Virtualizer for one-dimensional lists (vertical or horizontal).
 * Supports optional lanes for grid-like layouts.
 * Uses incremental measurement with caching for dynamic item sizes.
 */
export class ListVirtualizer extends Virtualizer<ListVirtualizerOptions> {
  private measuredSizes: Map<number, number> = new Map()
  private fenwick: FenwickTree | null = null
  private sizeCache: Float64Array | null = null
  private groups: ListVirtualizerOptions["groups"] | null = null

  constructor(options: ListVirtualizerOptions) {
    super(options)
    if (options.initialSize) {
      this.setViewportSize(options.initialSize)
    }
  }

  private get lanes(): number {
    return this.options.lanes ?? 1
  }

  private get isGrid(): boolean {
    return this.lanes > 1
  }

  protected initializeMeasurements(): void {
    this.resetMeasurements()
  }

  protected resetMeasurements(): void {
    this.measureCache.clear()
    this.groups = this.options.groups?.slice().sort((a, b) => a.startIndex - b.startIndex) ?? null
    const count = this.options.count
    this.fenwick = new FenwickTree(count)
    this.sizeCache = new Float64Array(count)
    for (let i = 0; i < count; i++) {
      const size = this.getItemSize(i)
      this.sizeCache[i] = size
      this.fenwick.add(i, size + (i < count - 1 ? this.options.gap : 0))
    }
  }

  protected onItemsChanged(): void {
    this.measuredSizes.clear()
    this.resetMeasurements()
  }

  protected getKnownItemSize(index: number): number | undefined {
    return this.measuredSizes.get(index)
  }

  protected onItemMeasured(index: number, size: number): boolean {
    const currentSize = this.getItemSize(index)
    if (currentSize === size) return false

    this.measuredSizes.set(index, size)

    if (!this.fenwick || !this.sizeCache) return true

    const delta = size - this.sizeCache[index]
    this.sizeCache[index] = size

    if (delta !== 0) {
      this.fenwick.add(index, delta)
    }

    return true
  }

  protected getMeasurement(index: number): { start: number; size: number; end: number } {
    const cached = this.measureCache.get(index)
    if (cached) return cached

    const { paddingStart, gap } = this.options
    const size = this.getItemSize(index)

    let start: number
    if (this.isGrid) {
      // For grid mode, calculate row-based positioning
      const row = Math.floor(index / this.lanes)
      const rowHeight = this.getEstimatedSize(0) + gap
      start = paddingStart + row * rowHeight
    } else {
      // For list mode, use prefix sum
      const prefix = this.getPrefixSize(index - 1)
      start = paddingStart + prefix
    }

    const measurement: { start: number; size: number; end: number } = {
      start,
      size,
      end: start + size,
    }

    this.measureCache.set(index, measurement)
    return measurement
  }

  protected getItemLane(index: number): number {
    return this.isGrid ? index % this.lanes : 0
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count, paddingStart, gap } = this.options
    if (count === 0) return { startIndex: 0, endIndex: -1 }

    if (this.isGrid) {
      // Grid mode: calculate based on rows
      const rowHeight = this.getEstimatedSize(0) + gap
      const startRow = Math.max(0, Math.floor((viewportStart - paddingStart) / rowHeight))
      const endRow = Math.ceil((viewportEnd - paddingStart) / rowHeight)

      const startIndex = startRow * this.lanes
      const endIndex = Math.min(endRow * this.lanes + this.lanes - 1, count - 1)

      return { startIndex, endIndex }
    }

    // List mode: use binary search with fenwick tree
    const startIndex = this.findIndexAtOffset(viewportStart)

    // Find end index efficiently using prefix sums
    let endIndex = startIndex
    let endPos = paddingStart + this.getPrefixSize(startIndex) + this.getItemSize(startIndex)

    while (endIndex < count - 1 && endPos < viewportEnd) {
      endIndex++
      endPos += gap + this.getItemSize(endIndex)
    }

    return { startIndex, endIndex }
  }

  getItemState(virtualItem: VirtualItem): ItemState {
    const { horizontal, gap } = this.options
    const { index, start, size, lane } = virtualItem

    if (this.isGrid) {
      const laneSize = this.getLaneSize()
      const laneOffset = lane * (laneSize + gap)

      return {
        index,
        key: index,
        position: horizontal ? { x: start, y: laneOffset } : { x: laneOffset, y: start },
        size: { width: laneSize, height: size },
        isScrolling: this.isScrolling,
      }
    }

    return {
      index,
      key: index,
      position: horizontal ? { x: start, y: 0 } : { x: 0, y: start },
      size: {
        width: horizontal ? size : "100%",
        height: horizontal ? "100%" : size,
      },
      isScrolling: this.isScrolling,
    }
  }

  getItemStyle(virtualItem: VirtualItem): CSSProperties {
    const { horizontal, rtl, gap } = this.options
    const { start, lane } = virtualItem

    if (this.isGrid) {
      const laneSize = this.getLaneSize()
      let x = lane * (laneSize + gap)
      const y = start

      // For RTL mode, reverse the lane positioning
      if (rtl) {
        x = (this.lanes - 1 - lane) * (laneSize + gap)
      }

      let transform: string
      if (horizontal) {
        transform = rtl ? `translate3d(-${y}px, ${x}px, 0)` : `translate3d(${y}px, ${x}px, 0)`
      } else {
        transform = `translate3d(${x}px, ${y}px, 0)`
      }

      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: laneSize,
        height: undefined,
        transform,
      }
    }

    // List mode
    let transform: string
    if (horizontal) {
      transform = rtl ? `translate3d(-${start}px, 0, 0)` : `translate3d(${start}px, 0, 0)`
    } else {
      transform = `translate3d(0, ${start}px, 0)`
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: horizontal ? undefined : "100%",
      height: horizontal ? "100%" : undefined,
      transform,
    }
  }

  getTotalSize(): number {
    const { count, paddingStart, paddingEnd, gap } = this.options

    if (count === 0) return paddingStart + paddingEnd

    if (this.isGrid) {
      // Grid mode: calculate based on rows
      const rows = Math.ceil(count / this.lanes)
      const rowHeight = this.getEstimatedSize(0)
      return paddingStart + rows * rowHeight + (rows - 1) * gap + paddingEnd
    }

    // List mode: use fenwick tree for O(log n) total size calculation
    const lastItemStart = this.getPrefixSize(count - 1)
    const lastItemSize = this.getItemSize(count - 1)

    return paddingStart + lastItemStart + lastItemSize + paddingEnd
  }

  private getLaneSize(): number {
    const { gap } = this.options
    if (this.containerSize <= 0) return 200
    return (this.containerSize - (this.lanes - 1) * gap) / this.lanes
  }

  protected onContainerSizeChange(): void {
    // Grid measurement depends on container width for lane sizing
    if (this.isGrid) {
      this.measureCache.clear()
    }
  }

  private getItemSize(index: number): number {
    const measuredSize = this.measuredSizes?.get(index)
    if (measuredSize !== undefined) return measuredSize

    // Fast path: use sizeCache if available and populated (O(1) array access)
    // Note: sizeCache values are > 0 when populated, 0 means uninitialized
    if (this.sizeCache && index < this.sizeCache.length && this.sizeCache[index] > 0) {
      return this.sizeCache[index]
    }

    // Fallback: check measured sizes, then getItemSize callback, then estimate
    const { getItemSize } = this.options
    return getItemSize?.(index) ?? this.getEstimatedSize(index)
  }

  private getPrefixSize(index: number): number {
    // Lazy initialization: recreate fenwick if null
    if (!this.fenwick) {
      const count = this.options.count
      this.fenwick = new FenwickTree(count)
      this.sizeCache = new Float64Array(count)
      for (let i = 0; i < count; i++) {
        const size = this.getItemSize(i)
        this.sizeCache[i] = size
        this.fenwick.add(i, size + (i < count - 1 ? this.options.gap : 0))
      }
    }

    return this.fenwick.prefixSumWithGap(index, this.options.gap)
  }

  protected findIndexAtOffset(offset: number): number {
    const { paddingStart, gap } = this.options

    if (this.isGrid) {
      // Grid mode: calculate based on rows
      const adjustedOffset = Math.max(0, offset - paddingStart)
      const rowHeight = this.getEstimatedSize(0) + gap
      const row = Math.floor(adjustedOffset / rowHeight)
      return Math.min(row * this.lanes, this.options.count - 1)
    }

    // List mode: use fenwick tree
    return this.fenwick?.lowerBoundWithPadding(offset, paddingStart) ?? 0
  }

  /**
   * Group helpers (for sticky headers)
   */
  getGroupForIndex(index: number) {
    if (!this.groups || this.groups.length === 0) return null
    // Groups are sorted; find the last group whose startIndex <= index
    let lo = 0
    let hi = this.groups.length - 1
    let result: (typeof this.groups)[number] | null = null
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const g = this.groups[mid]
      if (g.startIndex <= index) {
        result = g
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  /**
   * Returns info needed to render a sticky header.
   * translateY lets you push the current header up when the next group approaches.
   */
  getGroupHeaderState(viewportOffset: number, headerSizeOverride?: number) {
    if (!this.groups || this.groups.length === 0) return null
    const currentIndex = this.findIndexAtOffset(viewportOffset)
    const currentGroup = this.getGroupForIndex(currentIndex)
    if (!currentGroup) return null

    const currentStart = this.getMeasurement(currentGroup.startIndex).start
    const currentHeaderSize = headerSizeOverride ?? currentGroup.headerSize ?? 0

    // Look ahead to next group to compute push-off distance
    const currentIdx = this.groups.indexOf(currentGroup)
    const nextGroup = this.groups[currentIdx + 1]
    const nextStart = nextGroup ? this.getMeasurement(nextGroup.startIndex).start : Infinity

    const distanceToNext = nextStart - viewportOffset - currentHeaderSize
    const translateY = Math.min(0, distanceToNext < 0 ? distanceToNext : 0)

    return {
      group: currentGroup,
      headerSize: currentHeaderSize,
      translateY,
      offset: viewportOffset - currentStart,
    }
  }

  /**
   * Get ARIA attributes for the list container
   */
  getContainerAriaAttrs() {
    const { count, horizontal } = this.options
    return {
      role: "list" as const,
      "aria-orientation": horizontal ? ("horizontal" as const) : ("vertical" as const),
      "aria-rowcount": horizontal ? undefined : count,
      "aria-colcount": horizontal ? count : undefined,
    }
  }

  /**
   * Get ARIA attributes for a list item
   */
  getItemAriaAttrs(index: number) {
    const { count } = this.options
    return {
      role: "listitem" as const,
      "aria-posinset": index + 1,
      "aria-setsize": count,
    }
  }
}
