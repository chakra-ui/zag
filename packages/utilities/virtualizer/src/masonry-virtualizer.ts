import type { CSSProperties, ItemState, MasonryVirtualizerOptions, Range, VirtualItem } from "./types"
import { CacheManager } from "./utils/cache-manager"
import { Virtualizer } from "./virtualizer"

/**
 * Virtualizer for masonry layouts (Pinterest-style multi-lane columns).
 */
export class MasonryVirtualizer extends Virtualizer<MasonryVirtualizerOptions> {
  private laneItems!: Array<Array<{ index: number; start: number; end: number }>>
  private laneOffsets!: number[]
  private masonryPositions!: Map<number, { start: number; lane: number }>
  private measuredSizes!: Map<number, number>
  private rangeCache!: CacheManager<string, Range>

  protected initializeMeasurements(): void {
    this.recalculatePositions()
  }

  protected resetMeasurements(): void {
    if (!this.masonryPositions) this.masonryPositions = new Map()
    if (!this.measuredSizes) this.measuredSizes = new Map()
    if (!this.laneOffsets) this.laneOffsets = []
    if (!this.laneItems) this.laneItems = []

    this.measureCache.clear()
    this.masonryPositions.clear()
    this.laneItems = []

    if (!this.rangeCache) this.rangeCache = new CacheManager<string, Range>(50)
    this.rangeCache.clear()
    this.recalculatePositions()
  }

  protected onItemsChanged(): void {
    this.measuredSizes?.clear()
    this.resetMeasurements()
  }

  protected getKnownItemSize(index: number): number | undefined {
    return this.measuredSizes?.get(index)
  }

  protected onItemMeasured(index: number, size: number): boolean {
    if (!this.measuredSizes) this.measuredSizes = new Map()
    const currentSize = this.getItemSize(index)
    if (currentSize === size) return false

    this.measuredSizes.set(index, size)

    // Use incremental updates instead of full recalculation
    this.updatePositionsFrom(index)
    return true
  }

  protected onCrossAxisSizeChange(): void {
    this.resetMeasurements()
  }

  protected getMeasurement(index: number) {
    const cached = this.measureCache.get(index)
    if (cached) return cached

    // Ensure positions are available before reading
    this.recalculatePositions()
    return this.measureCache.get(index) ?? { start: 0, size: 0, end: 0 }
  }

  protected getItemLane(index: number): number {
    return this.masonryPositions?.get(index)?.lane ?? 0
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count, lanes, gap, paddingStart = 0 } = this.options
    if (count === 0) return { startIndex: 0, endIndex: -1 }

    // Ensure lane index is available
    if (!this.laneItems || this.laneItems.length === 0) this.recalculatePositions()

    if (!this.rangeCache) this.rangeCache = new CacheManager<string, Range>(50)
    const cacheKey = `${viewportStart}:${viewportEnd}:${count}:${lanes}:${gap}:${paddingStart}:${this.crossAxisSize}`
    const cached = this.rangeCache.get(cacheKey)
    if (cached) return cached

    let startIndex = count
    let endIndex = -1

    for (let lane = 0; lane < lanes; lane++) {
      const items = this.laneItems[lane]
      if (!items || items.length === 0) continue

      const firstPos = this.findFirstLaneItemIntersecting(items, viewportStart)
      if (firstPos === -1) continue

      const lastPos = this.findLastLaneItemStartingBefore(items, viewportEnd)
      if (lastPos === -1) continue

      startIndex = Math.min(startIndex, items[firstPos].index)
      endIndex = Math.max(endIndex, items[lastPos].index)
    }

    if (startIndex > endIndex) {
      const near = this.findIndexAtOffset(viewportStart)
      const range = { startIndex: near, endIndex: near }
      this.rangeCache.set(cacheKey, range)
      return range
    }

    const range = { startIndex, endIndex }
    this.rangeCache.set(cacheKey, range)
    return range
  }

  protected findIndexAtOffset(offset: number): number {
    const { count, lanes } = this.options
    if (count === 0) return 0

    // Ensure lane index is available
    if (!this.laneItems || this.laneItems.length === 0) this.recalculatePositions()

    let bestIndex = 0
    let bestStart = -Infinity

    for (let lane = 0; lane < lanes; lane++) {
      const items = this.laneItems[lane]
      if (!items || items.length === 0) continue

      const pos = this.findLastLaneItemStartingBefore(items, offset)
      if (pos === -1) continue

      const candidate = items[pos]
      if (candidate.start > bestStart) {
        bestStart = candidate.start
        bestIndex = candidate.index
      }
    }

    return bestIndex
  }

  getItemState(virtualItem: VirtualItem): ItemState {
    const { gap } = this.options
    const { index, start, size, lane } = virtualItem
    const laneSize = this.getLaneSize()
    const x = lane * (laneSize + gap)

    return {
      index,
      key: virtualItem.key,
      position: { x, y: start },
      size: { width: laneSize, height: size },
      isScrolling: this.isScrolling,
    }
  }

  getItemStyle(virtualItem: VirtualItem): CSSProperties {
    const { gap, rtl } = this.options
    const { start, lane } = virtualItem
    const laneSize = this.getLaneSize()

    let x = lane * (laneSize + gap)

    // For RTL mode, reverse the lane positioning
    if (rtl) {
      const totalLanes = this.getTotalLanes()
      x = (totalLanes - 1 - lane) * (laneSize + gap)
    }

    // Don't constrain height - let items size naturally for measurement
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: laneSize,
      height: undefined,
      transform: `translate3d(${x}px, ${start}px, 0)`,
    }
  }

  getTotalSize(): number {
    if (!this.laneOffsets || this.laneOffsets.length === 0) {
      this.recalculatePositions()
    }

    const { paddingEnd, paddingStart } = this.options
    const maxOffset = this.laneOffsets.length ? Math.max(...this.laneOffsets) : paddingStart
    return maxOffset + paddingEnd
  }

  private recalculatePositions(): void {
    const { count, lanes, gap, paddingStart = 0 } = this.options

    if (!this.masonryPositions) this.masonryPositions = new Map()
    if (!this.measuredSizes) this.measuredSizes = new Map()
    if (!this.laneOffsets) this.laneOffsets = []
    if (!this.laneItems) this.laneItems = []
    if (!this.rangeCache) this.rangeCache = new CacheManager<string, Range>(50)

    this.laneOffsets = new Array(lanes).fill(paddingStart)
    this.laneItems = new Array(lanes).fill(null).map(() => [] as Array<{ index: number; start: number; end: number }>)
    this.masonryPositions.clear()
    this.measureCache.clear()
    this.rangeCache.clear()

    for (let i = 0; i < count; i++) {
      const lane = this.getShortestLane()
      const start = this.laneOffsets[lane]
      const size = this.getItemSize(i)
      const end = start + size

      this.masonryPositions.set(i, { start, lane })
      this.measureCache.set(i, { start, size, end })
      this.laneItems[lane].push({ index: i, start, end })

      this.laneOffsets[lane] += size + gap
    }
  }

  private getShortestLane(): number {
    if (!this.laneOffsets || this.laneOffsets.length === 0) return 0
    let shortestLane = 0
    let shortestOffset = this.laneOffsets[0] ?? 0

    for (let lane = 1; lane < this.laneOffsets.length; lane++) {
      if (this.laneOffsets[lane] < shortestOffset) {
        shortestLane = lane
        shortestOffset = this.laneOffsets[lane]
      }
    }

    return shortestLane
  }

  private getItemSize(index: number): number {
    const laneSize = this.getLaneSize()
    return this.measuredSizes?.get(index) ?? this.getEstimatedSize(index, laneSize)
  }

  private getLaneSize(): number {
    const { lanes, gap } = this.options
    if (this.crossAxisSize <= 0) return 200
    return (this.crossAxisSize - (lanes - 1) * gap) / lanes
  }

  private getTotalLanes(): number {
    return this.options.lanes
  }

  /**
   * Incremental update: recalculate positions from a specific index onwards
   */
  private updatePositionsFrom(fromIndex: number): void {
    const { count, lanes, gap, paddingStart = 0 } = this.options

    if (fromIndex === 0) {
      this.recalculatePositions()
      return
    }

    if (!this.masonryPositions) this.masonryPositions = new Map()
    if (!this.measuredSizes) this.measuredSizes = new Map()
    if (!this.laneOffsets) this.laneOffsets = new Array(lanes).fill(paddingStart)
    if (!this.laneItems) this.laneItems = new Array(lanes).fill(null).map(() => [])

    // Find the lane heights at the point where we're starting the update
    const laneHeights = new Array(lanes).fill(paddingStart)
    const nextLaneItems = new Array(lanes)
      .fill(null)
      .map(() => [] as Array<{ index: number; start: number; end: number }>)

    // Calculate lane heights up to fromIndex
    for (let i = 0; i < fromIndex; i++) {
      const position = this.masonryPositions.get(i)
      const cached = this.measureCache.get(i)
      if (position && cached) {
        nextLaneItems[position.lane].push({ index: i, start: cached.start, end: cached.end })
        laneHeights[position.lane] = Math.max(laneHeights[position.lane], cached.end + gap)
      }
    }

    // Update positions from fromIndex onwards
    for (let i = fromIndex; i < count; i++) {
      // Find shortest lane
      let shortestLane = 0
      let shortestHeight = laneHeights[0] ?? paddingStart
      for (let lane = 1; lane < lanes; lane++) {
        if (laneHeights[lane] < shortestHeight) {
          shortestLane = lane
          shortestHeight = laneHeights[lane]
        }
      }

      const start = laneHeights[shortestLane]
      const size = this.getItemSize(i)
      const end = start + size

      // Update position and measurement cache
      this.masonryPositions.set(i, { start, lane: shortestLane })
      this.measureCache.set(i, { start, size, end })
      nextLaneItems[shortestLane].push({ index: i, start, end })

      // Update lane height
      laneHeights[shortestLane] = end + gap
    }

    // Update lane offsets for total size calculation
    this.laneOffsets = laneHeights.map((h) => Math.max(paddingStart, h - gap)) // Remove trailing gap
    this.laneItems = nextLaneItems
    this.rangeCache?.clear()
  }

  /**
   * Binary search for the first item in a lane whose end >= viewportStart.
   * Returns the position in the lane array, or -1 if none.
   */
  private findFirstLaneItemIntersecting(
    items: Array<{ index: number; start: number; end: number }>,
    viewportStart: number,
  ): number {
    let lo = 0
    let hi = items.length - 1
    let res = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (items[mid].end >= viewportStart) {
        res = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return res
  }

  /**
   * Binary search for the last item in a lane whose start <= viewportEnd.
   * Returns the position in the lane array, or -1 if none.
   */
  private findLastLaneItemStartingBefore(
    items: Array<{ index: number; start: number; end: number }>,
    viewportEnd: number,
  ): number {
    let lo = 0
    let hi = items.length - 1
    let res = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (items[mid].start <= viewportEnd) {
        res = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return res
  }
}
