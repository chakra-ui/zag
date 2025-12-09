import { Virtualizer } from "./virtualizer"
import { FenwickTree } from "./fenwick-tree"
import type { ListVirtualizerOptions, Range, VirtualItem, CSSProperties, ItemState } from "./types"

/**
 * Virtualizer for one-dimensional lists (vertical or horizontal).
 * Uses incremental measurement with caching for dynamic item sizes.
 */
export class ListVirtualizer extends Virtualizer<ListVirtualizerOptions> {
  private measuredSizes: Map<number, number> = new Map()
  private fenwick: FenwickTree | null = null
  private sizeCache: Float64Array | null = null
  private groups: ListVirtualizerOptions["groups"] | null = null

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

  protected onItemMeasured(index: number, size: number): void {
    this.measuredSizes.set(index, size)
    if (!this.fenwick || !this.sizeCache) return
    const current = this.sizeCache[index]
    this.sizeCache[index] = size
    const delta = size - current
    this.fenwick.add(index, delta)
  }

  protected getMeasurement(index: number): { start: number; size: number; end: number } {
    const cached = this.measureCache.get(index)
    if (cached) return cached

    const { paddingStart } = this.options
    const size = this.getItemSize(index)
    const prefix = this.getPrefixSize(index - 1)
    const start = paddingStart + prefix

    const measurement: { start: number; size: number; end: number } = {
      start,
      size,
      end: start + size,
    }

    this.measureCache.set(index, measurement)
    return measurement
  }

  protected getItemLane(): number {
    return 0
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count, paddingStart } = this.options
    if (count === 0) return { startIndex: 0, endIndex: -1 }

    // Use binary search to find start index - O(log n)
    const startIndex = this.findIndexAtOffset(viewportStart)

    // Find end index efficiently using prefix sums
    // Instead of calling getMeasurement in a loop, calculate end position directly
    let endIndex = startIndex
    let endPos = paddingStart + this.getPrefixSize(startIndex) + this.getItemSize(startIndex)

    while (endIndex < count - 1 && endPos < viewportEnd) {
      endIndex++
      endPos += this.options.gap + this.getItemSize(endIndex)
    }

    return { startIndex, endIndex }
  }

  protected getItemStateData(virtualItem: VirtualItem): ItemState {
    const { horizontal } = this.options
    const { index, start, size } = virtualItem

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

  protected getItemStyleData(virtualItem: VirtualItem): CSSProperties {
    const { horizontal, rtl } = this.options
    const { start, size } = virtualItem

    // For RTL horizontal mode, we need to position from the right
    let transform: string
    if (horizontal) {
      if (rtl) {
        // In RTL mode, items are positioned from the right
        transform = `translate3d(-${start}px, 0, 0)`
      } else {
        transform = `translate3d(${start}px, 0, 0)`
      }
    } else {
      // Vertical mode is not affected by RTL
      transform = `translate3d(0, ${start}px, 0)`
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: horizontal ? size : "100%",
      height: horizontal ? "100%" : size,
      transform,
      contain: "layout style paint",
    }
  }

  getTotalSize(): number {
    const { count, paddingStart, paddingEnd } = this.options

    if (count === 0) return paddingStart + paddingEnd

    // Use fenwick tree for O(log n) total size calculation instead of O(n) iteration
    // getPrefixSize(count - 1) gives us the position of the last item
    // Add the size of the last item to get total content size
    const lastItemStart = this.getPrefixSize(count - 1)
    const lastItemSize = this.getItemSize(count - 1)

    return paddingStart + lastItemStart + lastItemSize + paddingEnd
  }

  private getItemSize(index: number): number {
    // Fast path: use sizeCache if available and populated (O(1) array access)
    // Note: sizeCache values are > 0 when populated, 0 means uninitialized
    if (this.sizeCache && index < this.sizeCache.length && this.sizeCache[index] > 0) {
      return this.sizeCache[index]
    }

    // Fallback: check measured sizes, then getItemSize callback, then estimate
    const { estimatedSize, getItemSize } = this.options
    return this.measuredSizes?.get(index) ?? getItemSize?.(index) ?? estimatedSize
  }

  private getPrefixSize(index: number): number {
    if (index < 0) return 0

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

    const total = this.fenwick.prefixSum(index)
    // Only subtract gap if there's actually a gap configured
    const { gap } = this.options
    return gap > 0 ? total - gap : total
  }

  protected findIndexAtOffset(offset: number): number {
    if (!this.fenwick) return 0
    const { paddingStart } = this.options
    const target = Math.max(0, offset - paddingStart)
    return this.fenwick.lowerBound(target)
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
}
