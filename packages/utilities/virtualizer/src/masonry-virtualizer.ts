import { Virtualizer } from "./virtualizer"
import type { MasonryVirtualizerOptions, Range, VirtualItem, CSSProperties, ItemState } from "./types"

/**
 * Virtualizer for masonry layouts (Pinterest-style multi-lane columns).
 */
export class MasonryVirtualizer extends Virtualizer<MasonryVirtualizerOptions> {
  private laneOffsets: number[] = []
  private masonryPositions: Map<number, { start: number; lane: number }> = new Map()
  private measuredSizes: Map<number, number> = new Map()

  protected initializeMeasurements(): void {
    this.recalculatePositions()
  }

  protected resetMeasurements(): void {
    this.measureCache.clear()
    this.masonryPositions.clear()
    this.recalculatePositions()
  }

  protected onItemsChanged(): void {
    this.measuredSizes.clear()
    this.resetMeasurements()
  }

  protected getKnownItemSize(index: number): number | undefined {
    return this.measuredSizes.get(index)
  }

  protected onItemMeasured(index: number, size: number): boolean {
    const currentSize = this.getMasonryItemSize(index)
    if (currentSize === size) return false

    this.measuredSizes.set(index, size)

    // Use incremental updates instead of full recalculation
    this.updatePositionsFrom(index)
    return true
  }

  protected onContainerSizeChange(): void {
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
    return this.masonryPositions.get(index)?.lane ?? 0
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count, lanes } = this.options

    let startIndex = count
    let endIndex = -1

    for (let i = 0; i < count; i++) {
      const measurement = this.getMeasurement(i)
      if (measurement.end >= viewportStart && measurement.start <= viewportEnd) {
        startIndex = Math.min(startIndex, i)
        endIndex = Math.max(endIndex, i)
      }
    }

    if (startIndex > endIndex) {
      return { startIndex: 0, endIndex: Math.min(lanes - 1, count - 1) }
    }

    return { startIndex, endIndex }
  }

  protected findIndexAtOffset(offset: number): number {
    // For masonry, we need to search through items since positions are irregular
    // Use binary search for better performance than linear search
    const { count, paddingStart } = this.options
    const targetOffset = Math.max(0, offset - paddingStart)

    let low = 0
    let high = count - 1
    let result = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const measurement = this.getMeasurement(mid)

      if (measurement.start <= targetOffset) {
        result = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return result
  }

  getItemState(virtualItem: VirtualItem): ItemState {
    const { gap } = this.options
    const { index, start, size, lane } = virtualItem
    const laneSize = this.getLaneSize()
    const x = lane * (laneSize + gap)

    return {
      index,
      key: index,
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
    if (this.laneOffsets.length === 0) {
      this.recalculatePositions()
    }

    const { paddingEnd, paddingStart } = this.options
    const maxOffset = this.laneOffsets.length ? Math.max(...this.laneOffsets) : paddingStart
    return maxOffset + paddingEnd
  }

  private recalculatePositions(): void {
    const { count, lanes, gap, paddingStart } = this.options

    this.laneOffsets = new Array(lanes).fill(paddingStart)
    this.masonryPositions.clear()
    this.measureCache.clear()

    for (let i = 0; i < count; i++) {
      const lane = this.getShortestLane()
      const start = this.laneOffsets[lane]
      const size = this.getMasonryItemSize(i)

      this.masonryPositions.set(i, { start, lane })
      this.measureCache.set(i, { start, size, end: start + size })

      this.laneOffsets[lane] += size + gap
    }
  }

  private getShortestLane(): number {
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

  private getMasonryItemSize(index: number): number {
    const { getMasonryItemSize } = this.options
    const laneSize = this.getLaneSize()
    return this.measuredSizes.get(index) ?? getMasonryItemSize?.(index, laneSize) ?? this.getEstimatedSize(index)
  }

  private getLaneSize(): number {
    const { lanes, gap } = this.options
    if (this.containerSize <= 0) return 200
    return (this.containerSize - (lanes - 1) * gap) / lanes
  }

  private getTotalLanes(): number {
    return this.options.lanes
  }

  /**
   * Incremental update: recalculate positions from a specific index onwards
   */
  private updatePositionsFrom(fromIndex: number): void {
    const { count, lanes, gap } = this.options

    if (fromIndex === 0) {
      this.recalculatePositions()
      return
    }

    // Find the lane heights at the point where we're starting the update
    const laneHeights = new Array(lanes).fill(0)

    // Calculate lane heights up to fromIndex
    for (let i = 0; i < fromIndex; i++) {
      const position = this.masonryPositions.get(i)
      const cached = this.measureCache.get(i)
      if (position && cached) {
        laneHeights[position.lane] = Math.max(laneHeights[position.lane], cached.end + gap)
      }
    }

    // Update positions from fromIndex onwards
    for (let i = fromIndex; i < count; i++) {
      // Find shortest lane
      let shortestLane = 0
      let shortestHeight = laneHeights[0]
      for (let lane = 1; lane < lanes; lane++) {
        if (laneHeights[lane] < shortestHeight) {
          shortestLane = lane
          shortestHeight = laneHeights[lane]
        }
      }

      const start = laneHeights[shortestLane]
      const size = this.getMasonryItemSize(i)
      const end = start + size

      // Update position and measurement cache
      this.masonryPositions.set(i, { start, lane: shortestLane })
      this.measureCache.set(i, { start, size, end })

      // Update lane height
      laneHeights[shortestLane] = end + gap
    }

    // Update lane offsets for total size calculation
    this.laneOffsets = laneHeights.map((h) => h - gap) // Remove trailing gap
  }
}
