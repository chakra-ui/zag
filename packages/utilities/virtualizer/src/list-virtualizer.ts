import type { CSSProperties, ItemState, ListVirtualizerOptions, Range, VirtualItem } from "./types"
import { Virtualizer } from "./virtualizer"
import { CacheManager } from "./utils/cache-manager"
import { SizeTracker } from "./utils/size-tracker"

/**
 * Virtualizer for one-dimensional lists (vertical or horizontal).
 * Supports optional lanes for grid-like layouts.
 * Uses incremental measurement with caching for dynamic item sizes.
 */
export class ListVirtualizer extends Virtualizer<ListVirtualizerOptions> {
  private sizeTracker!: SizeTracker
  private groups: ListVirtualizerOptions["groups"] | null = null
  private rangeCache!: CacheManager<string, Range>

  constructor(options: ListVirtualizerOptions) {
    super(options)
    // These will be initialized lazily if needed
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

    // Initialize or reset size tracker
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(
        count,
        this.options.gap,
        (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
      )
    } else {
      this.sizeTracker.reset(count)
    }

    if (!this.rangeCache) {
      this.rangeCache = new CacheManager<string, Range>(50)
    }
  }

  protected onItemsChanged(): void {
    if (this.sizeTracker) {
      this.sizeTracker.clearMeasurements()
    }
    this.resetMeasurements()
  }

  protected getKnownItemSize(index: number): number | undefined {
    return this.getItemSize(index)
  }

  protected onItemMeasured(index: number, size: number): boolean {
    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(
        this.options.count,
        this.options.gap,
        (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
      )
    }

    const changed = this.sizeTracker.setMeasuredSize(index, size)
    if (!changed) return false

    // Also update parent's cache
    this.itemSizeCache.set(index, size)

    // Clear range cache as measurements changed
    if (this.rangeCache) {
      this.rangeCache.clear()
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

    // Initialize cache if needed
    if (!this.rangeCache) {
      this.rangeCache = new CacheManager<string, Range>(50)
    }

    // Check range cache first
    const cacheKey = `${viewportStart}:${viewportEnd}:${count}`
    const cached = this.rangeCache.get(cacheKey)
    if (cached) return cached

    let range: Range

    if (this.isGrid) {
      // Grid mode: calculate based on rows
      const rowHeight = this.getEstimatedSize(0) + gap
      const startRow = Math.max(0, Math.floor((viewportStart - paddingStart) / rowHeight))
      const endRow = Math.ceil((viewportEnd - paddingStart) / rowHeight)

      const startIndex = startRow * this.lanes
      const endIndex = Math.min(endRow * this.lanes + this.lanes - 1, count - 1)

      range = { startIndex, endIndex }
    } else {
      // List mode: use size tracker's optimized binary search
      // Initialize size tracker if needed
      if (!this.sizeTracker) {
        this.sizeTracker = new SizeTracker(
          this.options.count,
          this.options.gap,
          (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
        )
      }

      const startIndex = this.sizeTracker.findIndexAtOffset(viewportStart, paddingStart)
      const endIndex = this.sizeTracker.findIndexAtOffset(viewportEnd, paddingStart)

      range = { startIndex, endIndex }
    }

    // Cache the result (CacheManager handles LRU eviction automatically)
    this.rangeCache.set(cacheKey, range)

    return range
  }

  getItemState(virtualItem: VirtualItem): ItemState {
    const { horizontal, gap } = this.options
    const { index, start, size, lane } = virtualItem

    if (this.isGrid) {
      const laneSize = this.getLaneSize()
      const laneOffset = lane * (laneSize + gap)

      return {
        index,
        key: virtualItem.key,
        position: horizontal ? { x: start, y: laneOffset } : { x: laneOffset, y: start },
        size: { width: laneSize, height: size },
        isScrolling: this.isScrolling,
      }
    }

    return {
      index,
      key: virtualItem.key,
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

    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(
        this.options.count,
        this.options.gap,
        (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
      )
    }

    // List mode: use size tracker's optimized total size calculation
    return this.sizeTracker.getTotalSize(paddingStart, paddingEnd)
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
    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(
        this.options.count,
        this.options.gap,
        (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
      )
    }

    return this.sizeTracker.getSize(index)
  }

  private getPrefixSize(index: number): number {
    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(
        this.options.count,
        this.options.gap,
        (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
      )
    }

    return this.sizeTracker.getPrefixSum(index)
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

    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(
        this.options.count,
        this.options.gap,
        (i) => this.options.getItemSize?.(i) ?? this.getEstimatedSize(i),
      )
    }

    // List mode: use size tracker's optimized binary search
    return this.sizeTracker.findIndexAtOffset(offset, paddingStart)
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

  /**
   * Prepend items while preserving the current viewport (chat "load older" UX).
   *
   * This method:
   * - captures a keyed anchor (first visible item + intra-item offset)
   * - increases `count` by `addedCount`
   * - shifts internal measured sizes forward by `addedCount`
   * - clears measurement caches (start/end offsets change)
   * - restores scroll based on the anchor key
   *
   * For best results, provide `getItemKey` and preferably `getIndexForKey`.
   */
  prependItems(addedCount: number): void {
    if (addedCount <= 0) return

    const anchor = this.getScrollAnchor()

    // Update count (most callers prepend in data then call this once)
    this.options.count = this.options.count + addedCount

    // Shift group metadata if present (sticky headers)
    if (this.groups) {
      this.groups = this.groups.map((g) => ({ ...g, startIndex: g.startIndex + addedCount }))
    }

    // Shift measured sizes forward (index re-mapping) and rebuild size tracker
    this.sizeTracker.reindex(addedCount, this.options.count)

    // Item starts/ends have changed; drop all cached measurements/ranges
    this.rangeCache?.clear()
    this.invalidateMeasurements(0)
    this.calculateRange()

    // Restore anchor if possible (keyed)
    if (anchor) {
      this.restoreScrollAnchor(anchor)
    }
  }
}
