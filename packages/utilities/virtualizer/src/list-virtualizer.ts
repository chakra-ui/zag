import { isFunction, isNumber, invariant } from "@zag-js/utils/guard"
import { clampValue } from "@zag-js/utils/number"
import { AnimationFrame, resizeObserverBorderBox } from "@zag-js/dom-query"
import type {
  CSSProperties,
  GroupMeta,
  ItemMeasurement,
  ListVirtualizerOptions,
  Range,
  ScrollAnchor,
  VirtualItem,
  VirtualizerOptions,
} from "./types"
import type { PropTypes } from "@zag-js/types"
import { Virtualizer } from "./virtualizer"
import { SizeTracker } from "./utils/size-tracker"

type ResolvedListOptions = ListVirtualizerOptions & Pick<VirtualizerOptions, "estimatedItemSize">

function validateSizes(itemSize: number | undefined, estimatedItemSize: unknown): void {
  invariant(
    itemSize !== undefined && (!Number.isFinite(itemSize) || itemSize <= 0),
    "[@zag-js/virtualizer] `itemSize` must be a finite number greater than zero.",
  )
  invariant(
    itemSize === undefined && !estimatedItemSize,
    "[@zag-js/virtualizer] Provide `itemSize` or `estimatedItemSize`.",
  )
}

export class ListVirtualizer<T extends PropTypes = PropTypes> extends Virtualizer<ResolvedListOptions, T> {
  declare private sizeTracker: SizeTracker | undefined
  declare private groups: ListVirtualizerOptions["groups"] | null
  declare private groupStarts: Map<number, number> | null
  private refinedEstimate: number | undefined
  private refineFrame = AnimationFrame.create()
  private trailingSize = 0
  private trailingCleanup: VoidFunction | undefined

  constructor(options: ListVirtualizerOptions) {
    validateSizes(options.itemSize, options.estimatedItemSize)
    super({ ...options, estimatedItemSize: options.estimatedItemSize ?? 0 })
    if (options.initialRect) {
      const { width, height } = options.initialRect
      const horizontal = options.orientation === "horizontal"
      super.setViewportSize(horizontal ? width : height)
      super.setCrossAxisSize(horizontal ? height : width)
    }
    this.applyInitialMeasurements()
  }

  /**
   * Must be regular methods (not class fields): `Virtualizer`'s constructor calls
   * `initializeMeasurements()` during `super()` before subclass field initializers run.
   */
  protected initializeMeasurements(): void {
    this.resetMeasurements()
  }

  protected resetMeasurements(): void {
    this.measureCache.clear()
    this.groups = this.options.groups?.slice().sort((a, b) => a.startIndex - b.startIndex) ?? null
    this.groupStarts = this.groups ? new Map(this.groups.map((group, i) => [group.startIndex, i])) : null
    const count = this.options.count

    if (this.options.itemSize !== undefined) {
      this.sizeTracker = undefined
    } else {
      // seeded from the measured sizes, so an option change doesn't send measured items back to estimates
      this.sizeTracker = new SizeTracker(count, this.options.gap, (i) => this.getEstimatedSize(i))
      for (const [index, size] of this.itemSizeCache) {
        if (index < count) this.sizeTracker.setMeasuredSize(index, size)
      }
    }
  }

  // measured sizes survive a count change: by key when items have keys, else by index
  protected onItemsChanged(sizesByKey?: Map<string | number, number> | null): void {
    if (sizesByKey) this.itemSizeCache = this.getSizesByIndex(sizesByKey)
    this.resetMeasurements()
  }

  protected getKnownItemSize(index: number): number | undefined {
    return this.options.itemSize ?? this.itemSizeCache.get(index)
  }

  protected shouldMeasureItems(): boolean {
    return this.options.itemSize === undefined
  }

  protected getEstimatedSize(index: number): number {
    const { itemSize, estimatedItemSize } = this.options
    if (itemSize !== undefined) return itemSize
    const size = isNumber(estimatedItemSize)
      ? (this.refinedEstimate ?? estimatedItemSize)
      : super.getEstimatedSize(index)
    return size + this.getGroupHeaderEstimate(index)
  }

  private getGroupHeaderEstimate(index: number): number {
    const estimate = this.options.estimatedGroupHeaderSize
    if (estimate === undefined || !this.groups) return 0
    const groupIndex = this.groupStarts?.get(index)
    if (groupIndex === undefined) return 0
    const group = this.groups[groupIndex]
    return group.headerSize ?? (isNumber(estimate) ? estimate : estimate(group, groupIndex))
  }

  private getGroupHeaderSize(group: GroupMeta): number {
    if (group.headerSize !== undefined) return group.headerSize
    const estimate = this.options.estimatedGroupHeaderSize
    if (estimate === undefined) return 0
    return isNumber(estimate) ? estimate : estimate(group, this.groups?.indexOf(group) ?? 0)
  }

  protected onMeasurementsChanged(): void {
    if (!isNumber(this.options.estimatedItemSize) || this.options.itemSize !== undefined) return
    if (this.refineFrame.isActive() || !isFunction(globalThis.requestAnimationFrame)) return
    this.refineFrame.request(() => this.refineEstimate())
  }

  private refineEstimate(): void {
    const { estimatedItemSize } = this.options
    if (this.destroyed || this.isScrolling || !this.sizeTracker || !isNumber(estimatedItemSize)) return

    let total = 0
    let measured = 0
    for (const [index, size] of this.itemSizeCache) {
      if (index >= this.options.count || this.getGroupHeaderEstimate(index) > 0) continue
      total += size
      measured++
    }
    if (measured === 0) return

    const next = Math.round(total / measured)
    if (next <= 0 || next === (this.refinedEstimate ?? estimatedItemSize)) return

    const anchor = this.options.preserveScrollAnchor && this.scrollOffset > 0 ? this.getScrollAnchor() : null
    this.refinedEstimate = next
    this.sizeTracker.refreshEstimates()
    this.invalidateMeasurements(0)
    this.calculateRange({ reason: "measurement" })
    if (anchor) this.restoreScrollAnchor(anchor)
    this.notifyStore()
  }

  protected onItemMeasured(index: number, size: number): boolean {
    if (!this.shouldMeasureItems()) return false
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(this.options.count, this.options.gap, (i) => this.getEstimatedSize(i))
    }

    const changed = this.sizeTracker.setMeasuredSize(index, size)
    if (!changed) return false

    this.itemSizeCache.set(index, size)
    return true
  }

  protected getMeasurement(index: number): ItemMeasurement {
    const { itemSize, gap, paddingStart } = this.options
    if (itemSize !== undefined) {
      const start = paddingStart + index * (itemSize + gap)
      return { start, size: itemSize, end: start + itemSize }
    }

    // The cache is derived from the size tracker, so it is only valid for the version it was
    // built from. A dirty-floor index cannot express which entries a measurement invalidated.
    const version = this.sizeTracker!.version
    if (version !== this.measureCacheVersion) {
      this.measureCache.clear()
      this.measureCacheVersion = version
    }

    const cached = this.measureCache.get(index)
    if (cached) return cached

    const size = this.getItemSize(index)

    // List mode: use prefix sum
    const prefix = this.getPrefixSize(index - 1)
    const start = paddingStart + prefix

    const measurement: ItemMeasurement = {
      start,
      size,
      end: start + size,
    }

    this.measureCache.set(index, measurement)
    return measurement
  }

  protected getItemLane(_index: number): number {
    return 0
  }

  protected findVisibleRange(viewportStart: number, viewportEnd: number): Range {
    const { count, paddingStart } = this.options
    if (count === 0) return { startIndex: 0, endIndex: -1 }

    if (this.options.itemSize !== undefined) {
      return {
        startIndex: this.findIndexAtOffset(viewportStart),
        endIndex: this.findIndexAtOffset(viewportEnd),
      }
    }

    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(this.options.count, this.options.gap, (i) => this.getEstimatedSize(i))
    }

    const startIndex = this.sizeTracker.findIndexAtOffset(viewportStart, paddingStart)
    const endIndex = this.sizeTracker.findIndexAtOffset(viewportEnd, paddingStart)
    return { startIndex, endIndex }
  }

  protected getItemStyle(virtualItem: VirtualItem): CSSProperties {
    const horizontal = this.isHorizontal
    const isRtl = this.isRtl
    const scrollMargin = this.getScrollMargin()
    const { start } = virtualItem

    // List mode
    const offset = start - scrollMargin
    let transform: string
    if (horizontal) {
      transform = isRtl ? `translate3d(-${offset}px, 0, 0)` : `translate3d(${offset}px, 0, 0)`
    } else {
      transform = `translate3d(0, ${offset}px, 0)`
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: horizontal ? (this.options.itemSize === undefined ? undefined : `${this.options.itemSize}px`) : "100%",
      height: horizontal ? "100%" : this.options.itemSize === undefined ? undefined : `${this.options.itemSize}px`,
      boxSizing: this.options.itemSize !== undefined ? "border-box" : undefined,
      transform,
    }
  }

  protected invalidateLayout(): void {
    this.measureCache.clear()
    this.invalidateMeasurements(0)
  }

  /** Props for content after the last item, such as a loading row. It is measured automatically. */
  getTrailingProps(): T["element"] {
    return this.normalize.element({
      "data-virtualizer-trailing": this.id,
      style: this.getTrailingStyle(),
    })
  }

  protected override getTrackedParts(): string[] {
    return ["item", "trailing"]
  }

  protected override onElementAdded(element: HTMLElement): void {
    if (element.hasAttribute("data-virtualizer-trailing")) this.measureTrailing(element)
    else super.onElementAdded(element)
  }

  protected override onElementRemoved(element: HTMLElement): void {
    if (element.hasAttribute("data-virtualizer-trailing")) this.measureTrailing(null)
    else super.onElementRemoved(element)
  }

  private measureTrailing(element: HTMLElement | null): void {
    this.trailingCleanup?.()
    this.trailingCleanup = undefined
    if (!element || this.destroyed) {
      this.setTrailingSize(0)
      return
    }
    const rect = element.getBoundingClientRect()
    this.setTrailingSize(this.isHorizontal ? rect.width : rect.height)
    this.trailingCleanup = resizeObserverBorderBox.observe(element, (entry) => {
      const box = entry.borderBoxSize?.[0]
      const size = box ? (this.isHorizontal ? box.inlineSize : box.blockSize) : entry.contentRect.height
      this.setTrailingSize(size)
    })
  }

  private setTrailingSize(size: number): void {
    if (size === this.trailingSize || this.destroyed) return
    this.trailingSize = size
    this.notifyStore()
  }

  protected getTrailingStyle(): CSSProperties {
    const offset = this.getTotalSize() - this.options.paddingEnd - this.trailingSize - this.getScrollMargin()
    if (this.isHorizontal) {
      return {
        position: "absolute",
        top: 0,
        [this.isRtl ? "right" : "left"]: 0,
        height: "100%",
        transform: `translate3d(${this.isRtl ? -offset : offset}px, 0, 0)`,
      }
    }
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      transform: `translate3d(0, ${offset}px, 0)`,
    }
  }

  getTotalSize(): number {
    const { count, paddingStart, paddingEnd } = this.options

    const trailing = this.trailingSize
    if (count === 0) return paddingStart + trailing + paddingEnd

    if (this.options.itemSize !== undefined) {
      return paddingStart + count * this.options.itemSize + (count - 1) * this.options.gap + trailing + paddingEnd
    }

    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(this.options.count, this.options.gap, (i) => this.getEstimatedSize(i))
    }

    // List mode: use size tracker's optimized total size calculation
    return this.sizeTracker.getTotalSize(paddingStart, trailing + paddingEnd)
  }

  private getItemSize(index: number): number {
    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(this.options.count, this.options.gap, (i) => this.getEstimatedSize(i))
    }

    return this.sizeTracker.getSize(index)
  }

  private getPrefixSize(index: number): number {
    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(this.options.count, this.options.gap, (i) => this.getEstimatedSize(i))
    }

    return this.sizeTracker.getPrefixSum(index)
  }

  protected findIndexAtOffset(offset: number): number {
    const { paddingStart } = this.options

    if (this.options.itemSize !== undefined) {
      const { count, itemSize, gap } = this.options
      if (count === 0) return -1
      const index = Math.ceil(Math.max(0, offset - paddingStart) / (itemSize + gap)) - 1
      return clampValue(index, 0, count - 1)
    }

    // Initialize size tracker if needed
    if (!this.sizeTracker) {
      this.sizeTracker = new SizeTracker(this.options.count, this.options.gap, (i) => this.getEstimatedSize(i))
    }

    // List mode: use size tracker's optimized binary search
    return this.sizeTracker.findIndexAtOffset(offset, paddingStart)
  }

  /**
   * Group helpers (for sticky headers)
   */
  getGroupForIndex(index: number): GroupMeta | null {
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
    if (currentGroup.sticky === false) return null

    const currentStart = this.getMeasurement(currentGroup.startIndex).start
    const currentHeaderSize = headerSizeOverride ?? this.getGroupHeaderSize(currentGroup)

    // Look ahead to next group to compute push-off distance
    const currentIdx = this.groups.indexOf(currentGroup)
    const nextGroup = this.groups.slice(currentIdx + 1).find((group) => group.sticky !== false)
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

  getStickyGroupHeader(headerSizeOverride?: number) {
    const offset = this.getScrollState().offset[this.isHorizontal ? "x" : "y"] + this.getScrollMargin()
    return this.getGroupHeaderState(offset, headerSizeOverride)
  }

  protected override getRootAria(): Record<string, string | number> {
    if (this.options.aria === false) return {}
    return { role: "list" }
  }

  protected override getItemAria(index: number): Record<string, string | number> {
    if (this.options.aria === false) return {}
    return { role: "listitem", "aria-posinset": index + 1, "aria-setsize": this.options.count }
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
   * For best results, provide `indexToKey` and preferably `keyToIndex`.
   */
  prependItems(addedCount: number): void {
    if (addedCount <= 0) return

    const anchor = this.options.preserveScrollAnchor ? this.getPrependScrollAnchor(addedCount) : null

    // Update count (most callers prepend in data then call this once)
    this.options.count = this.options.count + addedCount

    // Shift group metadata if present (sticky headers)
    if (this.groups) {
      this.groups = this.groups.map((g) => ({
        ...g,
        startIndex: g.startIndex + addedCount,
      }))
    }

    // Shift measured sizes forward (index re-mapping) and rebuild size tracker
    this.sizeTracker?.reindex(addedCount, this.options.count)
    this.reindexItemSizeCache(addedCount)

    // Item starts/ends have changed; drop all cached measurements/ranges
    this.invalidateItemKeys()
    this.invalidateMeasurements(0)
    this.calculateRange({ reason: "count" })

    // Restore anchor if possible (keyed)
    if (anchor) {
      this.restoreScrollAnchor(anchor)
    }

    this.notifyStore()
  }

  private getPrependScrollAnchor(addedCount: number): ScrollAnchor | null {
    const anchor = this.getScrollAnchor()
    if (!anchor) return null

    const { count } = this.options
    const scrollMargin = this.getScrollMargin()
    const viewportStart = this.getScrollState().offset[this.isHorizontal ? "x" : "y"] + scrollMargin
    const anchorIndex = Math.min(count - 1, Math.max(0, this.findIndexAtOffset(viewportStart)))
    const shiftedIndex = anchorIndex + addedCount
    const indexToKey = this.options.indexToKey
    const key = indexToKey ? indexToKey(shiftedIndex) : shiftedIndex

    return {
      key,
      offset: anchor.offset,
    }
  }

  private reindexItemSizeCache(shift: number): void {
    const nextCache = new Map<number, number>()
    for (const [index, size] of this.itemSizeCache) {
      nextCache.set(index + shift, size)
    }
    this.itemSizeCache = nextCache
  }

  override updateOptions(nextOptions: Partial<ListVirtualizerOptions>): void {
    if (this.destroyed) return
    const itemSize = "itemSize" in nextOptions ? nextOptions.itemSize : this.options.itemSize
    const estimate = "estimatedItemSize" in nextOptions ? nextOptions.estimatedItemSize : this.options.estimatedItemSize
    validateSizes(itemSize, estimate)
    if ("estimatedItemSize" in nextOptions && estimate !== this.options.estimatedItemSize) {
      this.refinedEstimate = undefined
    }
    super.updateOptions(nextOptions)
  }

  override destroy(): void {
    this.refineFrame.cancel()
    this.trailingCleanup?.()
    this.trailingCleanup = undefined
    super.destroy()
  }
}
