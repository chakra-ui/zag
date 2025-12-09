import { Virtualizer } from "./virtualizer"
import type { GridVirtualizerOptions, Range, VirtualItem, CSSProperties, ItemState } from "./types"

/**
 * Virtualizer for grid layouts with fixed lane count.
 */
export class GridVirtualizer extends Virtualizer<GridVirtualizerOptions> {
  protected initializeMeasurements(): void {
    this.resetMeasurements()
  }

  protected resetMeasurements(): void {
    this.measureCache.clear()
  }

  protected getMeasurement(index: number) {
    const cached = this.measureCache.get(index)
    if (cached) return cached

    const { estimatedSize, gap, paddingStart, lanes } = this.options
    const row = Math.floor(index / lanes)
    const start = paddingStart + row * (estimatedSize + gap)

    const measurement = {
      start,
      size: estimatedSize,
      end: start + estimatedSize,
    }

    this.measureCache.set(index, measurement)
    return measurement
  }

  protected getItemLane(index: number): number {
    return index % this.options.lanes
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count, lanes, estimatedSize, gap, paddingStart } = this.options
    const rowHeight = estimatedSize + gap

    const startRow = Math.max(0, Math.floor((viewportStart - paddingStart) / rowHeight))
    const endRow = Math.ceil((viewportEnd - paddingStart) / rowHeight)

    const startIndex = startRow * lanes
    const endIndex = Math.min(endRow * lanes + lanes - 1, count - 1)

    return { startIndex, endIndex }
  }

  protected findIndexAtOffset(offset: number): number {
    const { paddingStart, lanes, estimatedSize, gap } = this.options
    const adjustedOffset = Math.max(0, offset - paddingStart)
    const rowHeight = estimatedSize + gap
    const row = Math.floor(adjustedOffset / rowHeight)
    return Math.min(row * lanes, this.options.count - 1)
  }

  protected getItemStateData(virtualItem: VirtualItem): ItemState {
    const { gap, horizontal } = this.options
    const { index, start, size, lane } = virtualItem
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

  protected getItemStyleData(virtualItem: VirtualItem): CSSProperties {
    const { gap, horizontal, rtl } = this.options
    const { start, size, lane } = virtualItem
    const laneSize = this.getLaneSize()

    let x = lane * (laneSize + gap)
    const y = start

    // For RTL mode, we need to adjust x positioning in horizontal grid
    if (horizontal && rtl) {
      const totalLanes = this.getTotalLanes()
      x = (totalLanes - 1 - lane) * (laneSize + gap)
    }

    let transform: string
    if (horizontal) {
      if (rtl) {
        transform = `translate3d(-${y}px, ${x}px, 0)`
      } else {
        transform = `translate3d(${y}px, ${x}px, 0)`
      }
    } else {
      // For vertical grids with RTL, reverse the lane positioning
      if (rtl) {
        const totalLanes = this.getTotalLanes()
        const rtlX = (totalLanes - 1 - lane) * (laneSize + gap)
        transform = `translate3d(${rtlX}px, ${y}px, 0)`
      } else {
        transform = `translate3d(${x}px, ${y}px, 0)`
      }
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: laneSize,
      height: size,
      transform,
      contain: "layout style paint",
    }
  }

  getTotalSize(): number {
    const { count, lanes, estimatedSize, gap, paddingStart, paddingEnd } = this.options
    if (count === 0) return paddingStart + paddingEnd

    const rows = Math.ceil(count / lanes)
    return paddingStart + rows * estimatedSize + (rows - 1) * gap + paddingEnd
  }

  protected onContainerSizeChange(): void {
    // Grid measurement doesn't depend on container width, but clearing cache
    // keeps lane sizing consistent if lane size was previously derived.
    this.measureCache.clear()
  }

  private getLaneSize(): number {
    const { lanes, gap } = this.options
    if (this.containerSize <= 0) return 200
    return (this.containerSize - (lanes - 1) * gap) / lanes
  }

  private getTotalLanes(): number {
    return this.options.lanes
  }
}
