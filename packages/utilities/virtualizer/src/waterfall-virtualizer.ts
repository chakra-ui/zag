import type {
  CSSProperties,
  ItemMeasurement,
  ItemState,
  Range,
  VirtualItem,
  WaterfallLayoutState,
  WaterfallVirtualizerOptions,
} from "./types"
import { Virtualizer } from "./virtualizer"

const DEFAULT_MIN_COLUMN_WIDTH = 240

/**
 * Virtualizer for vertical-only waterfall/masonry layouts.
 * Items are assigned by policy (`measured` shortest-column or `preserve` stable-lane).
 */
export class WaterfallVirtualizer extends Virtualizer<WaterfallVirtualizerOptions> {
  private layoutComputedUntil = -1
  private itemColumns: number[] = []
  private relayoutSourceColumns: number[] | null = null
  private laneItemIndices: number[][] = [[]]
  private laneItemStarts: number[][] = [[]]
  private laneItemEnds: number[][] = [[]]
  private columnOffsets: number[] = [0]
  private columnHeights: number[] = [0]
  private columnItemCounts: number[] = [0]
  private measuredSizeCache = new Map<number, number>()
  private resolvedColumnCount = 1
  private resolvedColumnWidth = DEFAULT_MIN_COLUMN_WIDTH

  constructor(options: WaterfallVirtualizerOptions) {
    super({
      orientation: "vertical",
      dir: "ltr",
      ...options,
    })

    if (options.initialRect) {
      const { width, height } = options.initialRect
      super.setViewportSize(height)
      super.setCrossAxisSize(width)
    }
    this.applyInitialMeasurements()
  }

  protected initializeMeasurements(): void {
    this.resetMeasurements()
  }

  protected resetMeasurements(): void {
    this.measureCache.clear()
    this.layoutComputedUntil = -1
    this.itemColumns = []
    this.relayoutSourceColumns = null
    this.recomputeColumns()
  }

  protected onItemsChanged(): void {
    const { count } = this.options
    for (const index of this.itemSizeCache.keys()) {
      if (index >= count) this.itemSizeCache.delete(index)
    }
    for (const index of this.measuredSizeCache.keys()) {
      if (index >= count) this.measuredSizeCache.delete(index)
    }
    this.resetMeasurements()
  }

  protected onCrossAxisSizeChange(): void {
    this.resetMeasurements()
  }

  protected onItemMeasured(index: number, size: number): boolean {
    const prevSize = this.measuredSizeCache.get(index)
    if (prevSize === size) return false

    this.measuredSizeCache.set(index, size)
    this.itemSizeCache.set(index, size)
    return true
  }

  protected getKnownItemSize(index: number): number | undefined {
    return this.measuredSizeCache.get(index)
  }

  protected getMeasurement(index: number): ItemMeasurement {
    if (index < this.measureCacheDirtyFrom) {
      const cached = this.measureCache.get(index)
      if (cached) return cached
    }

    this.consumeDirtyLayout()
    this.ensureLayout(index)

    const measurement = this.measureCache.get(index)
    if (!measurement) {
      return { start: this.options.paddingStart, end: this.options.paddingStart, size: 0 }
    }

    return measurement
  }

  protected getItemLane(index: number): number {
    this.consumeDirtyLayout()
    this.ensureLayout(index)
    return this.itemColumns[index] ?? 0
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count } = this.options
    if (count === 0) return { startIndex: 0, endIndex: -1 }

    this.consumeDirtyLayout()
    this.ensureLayout(count - 1)

    let startIndex = count
    let endIndex = -1

    for (let lane = 0; lane < this.resolvedColumnCount; lane++) {
      const laneIndices = this.laneItemIndices[lane]
      if (!laneIndices || laneIndices.length === 0) continue

      const laneStarts = this.laneItemStarts[lane]!
      const laneEnds = this.laneItemEnds[lane]!

      const firstVisible = this.findFirstGreaterThan(laneEnds, viewportStart)
      if (firstVisible >= laneIndices.length) continue

      const lastExclusive = this.findFirstGreaterOrEqual(laneStarts, viewportEnd)
      if (lastExclusive <= firstVisible) continue

      const laneStartIndex = laneIndices[firstVisible]!
      const laneEndIndex = laneIndices[lastExclusive - 1]!

      if (laneStartIndex < startIndex) startIndex = laneStartIndex
      if (laneEndIndex > endIndex) endIndex = laneEndIndex
    }

    if (endIndex === -1) {
      const fallback = this.findIndexAtOffset(viewportStart)
      return { startIndex: fallback, endIndex: fallback }
    }

    return { startIndex, endIndex }
  }

  protected findIndexAtOffset(offset: number): number {
    const { count } = this.options
    if (count === 0) return 0

    this.consumeDirtyLayout()
    this.ensureLayout(count - 1)

    let containingIndex = Infinity
    let nearestIndex = 0
    let nearestStart = Number.NEGATIVE_INFINITY

    for (let lane = 0; lane < this.resolvedColumnCount; lane++) {
      const laneIndices = this.laneItemIndices[lane]
      if (!laneIndices || laneIndices.length === 0) continue

      const laneStarts = this.laneItemStarts[lane]!
      const laneEnds = this.laneItemEnds[lane]!
      const candidatePosition = this.findFirstGreaterThan(laneStarts, offset) - 1
      if (candidatePosition < 0) continue

      const candidateIndex = laneIndices[candidatePosition]!
      const candidateStart = laneStarts[candidatePosition]!
      const candidateEnd = laneEnds[candidatePosition]!

      if (offset < candidateEnd && candidateIndex < containingIndex) {
        containingIndex = candidateIndex
      }

      if (candidateStart > nearestStart || (candidateStart === nearestStart && candidateIndex > nearestIndex)) {
        nearestStart = candidateStart
        nearestIndex = candidateIndex
      }
    }

    if (containingIndex !== Infinity) {
      return containingIndex
    }

    return nearestIndex
  }

  getItemState(virtualItem: VirtualItem): ItemState {
    const lane = virtualItem.lane
    const laneOffset = this.columnOffsets[lane] ?? 0

    return {
      index: virtualItem.index,
      key: virtualItem.key,
      position: { x: laneOffset, y: virtualItem.start },
      size: { width: this.resolvedColumnWidth, height: virtualItem.size },
      isScrolling: this.isScrolling,
      isVisible: virtualItem.isVisible,
    }
  }

  getItemStyle(virtualItem: VirtualItem): CSSProperties {
    const laneOffset = this.columnOffsets[virtualItem.lane] ?? 0
    const y = virtualItem.start - this.getScrollMargin()

    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: this.resolvedColumnWidth,
      transform: `translate3d(${laneOffset}px, ${y}px, 0)`,
    }
  }

  getVirtualItems(): VirtualItem[] {
    const items = super.getVirtualItems()
    if (items.length === 0) return items

    const viewportStart = this.getScrollState().offset.y + this.getScrollMargin()
    const viewportEnd = viewportStart + this.viewportSize

    for (const item of items) {
      const visible = item.end > viewportStart && item.start < viewportEnd
      item.isVisible = visible
      item.isOverscan = visible ? false : item.end <= viewportStart ? "before" : "after"
    }

    return items
  }

  getTotalSize(): number {
    const { count, paddingStart, paddingEnd } = this.options
    if (count === 0) return paddingStart + paddingEnd

    this.consumeDirtyLayout()
    this.ensureLayout(count - 1)

    let maxColumnEnd = paddingStart
    const rowGap = this.getRowGap()

    for (let column = 0; column < this.resolvedColumnCount; column++) {
      const hasItems = (this.columnItemCounts[column] ?? 0) > 0
      const trailingHeight = this.columnHeights[column] ?? paddingStart
      const effectiveEnd = hasItems ? trailingHeight - rowGap : trailingHeight
      if (effectiveEnd > maxColumnEnd) maxColumnEnd = effectiveEnd
    }

    return maxColumnEnd + paddingEnd
  }

  getWaterfallState(): WaterfallLayoutState {
    const totalSize = this.getTotalSize()
    const rowGap = this.getRowGap()
    const columns = Array.from({ length: this.resolvedColumnCount }, (_, index) => {
      const height = this.columnItemCounts[index]
        ? (this.columnHeights[index] ?? 0) - rowGap
        : this.options.paddingStart
      return {
        index,
        offset: this.columnOffsets[index] ?? 0,
        width: this.resolvedColumnWidth,
        height,
      }
    })

    return {
      columnCount: this.resolvedColumnCount,
      columnWidth: this.resolvedColumnWidth,
      columnGap: this.getColumnGap(),
      rowGap,
      totalSize,
      columns,
    }
  }

  private consumeDirtyLayout(): void {
    if (this.measureCacheDirtyFrom === Infinity) return

    const oldComputedUntil = this.layoutComputedUntil
    const dirtyFrom = Math.max(0, Math.floor(this.measureCacheDirtyFrom))
    const relayoutFrom = Math.min(dirtyFrom, oldComputedUntil + 1)

    if (relayoutFrom <= 0) {
      this.resetMeasurements()
      this.measureCacheDirtyFrom = Infinity
      return
    }

    const previousColumns = this.itemColumns
    const preservedColumns = this.itemColumns.slice(0, relayoutFrom)
    this.recomputeColumns()
    this.itemColumns = preservedColumns
    this.relayoutSourceColumns = this.getLaneAssignmentPolicy() === "preserve" ? previousColumns : null
    this.layoutComputedUntil = -1

    const rowGap = this.getRowGap()
    for (let index = 0; index < relayoutFrom; index++) {
      const lane = this.itemColumns[index]
      const measurement = this.measureCache.get(index)
      if (lane === undefined || lane < 0 || lane >= this.resolvedColumnCount || !measurement) {
        break
      }
      this.commitPlacement(index, lane, measurement, rowGap, false)
    }

    const truncateFrom = this.layoutComputedUntil + 1
    for (let index = truncateFrom; index <= oldComputedUntil; index++) {
      this.measureCache.delete(index)
    }
    this.itemColumns.length = truncateFrom

    this.measureCacheDirtyFrom = Infinity
  }

  private recomputeColumns(): void {
    this.resolvedColumnCount = this.resolveColumnCount()
    this.resolvedColumnWidth = this.resolveColumnWidth(this.resolvedColumnCount)
    this.columnOffsets = Array.from(
      { length: this.resolvedColumnCount },
      (_, index) => index * (this.resolvedColumnWidth + this.getColumnGap()),
    )
    this.columnHeights = Array.from({ length: this.resolvedColumnCount }, () => this.options.paddingStart)
    this.columnItemCounts = Array.from({ length: this.resolvedColumnCount }, () => 0)
    this.laneItemIndices = Array.from({ length: this.resolvedColumnCount }, () => [])
    this.laneItemStarts = Array.from({ length: this.resolvedColumnCount }, () => [])
    this.laneItemEnds = Array.from({ length: this.resolvedColumnCount }, () => [])
  }

  private resolveColumnCount(): number {
    if (this.options.columnCount && this.options.columnCount > 0) {
      return Math.max(1, Math.floor(this.options.columnCount))
    }

    const minColumnWidth = Math.max(1, this.options.minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH)
    if (this.crossAxisSize <= 0) return 1

    const columnGap = this.getColumnGap()
    const count = Math.floor((this.crossAxisSize + columnGap) / (minColumnWidth + columnGap))
    return Math.max(1, count)
  }

  private resolveColumnWidth(columnCount: number): number {
    const minColumnWidth = Math.max(1, this.options.minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH)
    if (this.crossAxisSize <= 0) return minColumnWidth
    if (columnCount <= 1) return this.crossAxisSize

    const totalGap = (columnCount - 1) * this.getColumnGap()
    return Math.max(1, (this.crossAxisSize - totalGap) / columnCount)
  }

  private ensureLayout(targetIndex: number): void {
    const count = this.options.count
    if (count === 0 || targetIndex < 0) return

    if (targetIndex >= count) targetIndex = count - 1
    if (targetIndex <= this.layoutComputedUntil) return

    const rowGap = this.getRowGap()
    for (let index = this.layoutComputedUntil + 1; index <= targetIndex; index++) {
      const lane = this.resolveLane(index)
      const start = this.columnHeights[lane] ?? this.options.paddingStart
      const size = this.measuredSizeCache.get(index) ?? this.getEstimatedSize(index, this.resolvedColumnWidth)
      const measurement: ItemMeasurement = {
        start,
        size,
        end: start + size,
      }
      this.commitPlacement(index, lane, measurement, rowGap, true)
    }
  }

  private resolveLane(index: number): number {
    if (this.getLaneAssignmentPolicy() === "preserve") {
      const preservedLane = this.relayoutSourceColumns?.[index]
      if (this.isValidLane(preservedLane)) return preservedLane
    }

    return this.getShortestColumn()
  }

  private commitPlacement(
    index: number,
    lane: number,
    measurement: ItemMeasurement,
    rowGap: number,
    cache: boolean,
  ): void {
    if (cache) {
      this.measureCache.set(index, measurement)
    }
    this.itemColumns[index] = lane
    this.columnItemCounts[lane] = (this.columnItemCounts[lane] ?? 0) + 1
    this.columnHeights[lane] = measurement.end + rowGap
    this.laneItemIndices[lane]?.push(index)
    this.laneItemStarts[lane]?.push(measurement.start)
    this.laneItemEnds[lane]?.push(measurement.end)
    this.layoutComputedUntil = index
  }

  private findFirstGreaterOrEqual(values: number[], target: number): number {
    let low = 0
    let high = values.length

    while (low < high) {
      const mid = (low + high) >> 1
      if ((values[mid] ?? 0) < target) low = mid + 1
      else high = mid
    }

    return low
  }

  private findFirstGreaterThan(values: number[], target: number): number {
    let low = 0
    let high = values.length

    while (low < high) {
      const mid = (low + high) >> 1
      if ((values[mid] ?? 0) <= target) low = mid + 1
      else high = mid
    }

    return low
  }

  private getShortestColumn(): number {
    let shortestIndex = 0
    let shortestHeight = this.columnHeights[0] ?? 0

    for (let index = 1; index < this.resolvedColumnCount; index++) {
      const height = this.columnHeights[index] ?? 0
      if (height < shortestHeight) {
        shortestHeight = height
        shortestIndex = index
      }
    }

    return shortestIndex
  }

  private isValidLane(lane: number | undefined): lane is number {
    return lane !== undefined && lane >= 0 && lane < this.resolvedColumnCount
  }

  private getLaneAssignmentPolicy(): "measured" | "preserve" {
    return this.options.laneAssignment ?? "measured"
  }

  private getColumnGap(): number {
    return this.options.columnGap ?? this.options.gap
  }

  private getRowGap(): number {
    return this.options.rowGap ?? this.options.gap
  }

  override destroy(): void {
    super.destroy()

    this.layoutComputedUntil = -1
    this.itemColumns = []
    this.relayoutSourceColumns = null
    this.laneItemIndices = [[]]
    this.laneItemStarts = [[]]
    this.laneItemEnds = [[]]
    this.columnOffsets = [0]
    this.columnHeights = [0]
    this.columnItemCounts = [0]
    this.measuredSizeCache.clear()
  }
}
