import { isHTMLElement, resizeObserverBorderBox } from "@zag-js/dom-query"
import type {
  CSSProperties,
  ItemMeasurement,
  ItemState,
  Range,
  ScrollAnchor,
  ScrollState,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  TimerId,
  VirtualItem,
  VirtualizerOptions,
} from "./types"
import { IntersectionObserverManager } from "./utils/intersection-observer-manager"
import { getScrollPosition, getScrollPositionFromEvent, setScrollPosition } from "./utils/scroll-helpers"
import { smoothScrollTo, type SmoothScrollResult } from "./utils/smooth-scroll"

const SCROLL_END_DELAY_MS = 150

type ResolvedBaseOptions = Required<Omit<VirtualizerOptions, "onScroll" | "onRangeChange" | "onVisibilityChange">> &
  Pick<VirtualizerOptions, "onScroll" | "onRangeChange" | "onVisibilityChange">

/**
 * Shared logic for all virtualizer variants (list, grid, table, masonry).
 * Layout-specific classes implement measurement and range calculation details.
 */
export abstract class Virtualizer<O extends VirtualizerOptions = VirtualizerOptions> {
  protected options: ResolvedBaseOptions & O

  // Measurements — lazy invalidation via dirty floor instead of Map iteration
  protected measureCache: Map<number, ItemMeasurement> = new Map()
  protected itemSizeCache: Map<number, number> = new Map()
  protected measureCacheDirtyFrom = Infinity

  // Scroll state
  protected scrollOffset = 0
  protected prevScrollOffset = 0
  protected scrollDirection: "forward" | "backward" = "forward"
  protected isScrolling = false
  private scrollEndTimer: TimerId | null = null

  // Viewport
  protected viewportSize = 0
  protected crossAxisSize = 0

  // Visible range — integer cache key (no string allocation)
  protected range: Range = { startIndex: 0, endIndex: -1 }
  private lastCalculatedOffset: number = -1
  private cachedVirtualItems: VirtualItem[] = []
  private cachedRangeStart = -1
  private cachedRangeEnd = -2
  private virtualItemObjectCache: Map<number, VirtualItem> = new Map()
  private keyIndexCache: Map<string | number, number> = new Map()

  // Advanced features
  private resizeObserverCleanups = new Map<Element, VoidFunction>()
  private intersectionObserver?: IntersectionObserverManager
  private scrollElementResizeCleanup?: VoidFunction

  // Dynamic sizing — microtask batch for ResizeObserver updates only
  private pendingSizeUpdates = new Map<number, number>()
  private sizeUpdateScheduled = false

  // Sync measurement batch — one idle notification after all refs in a commit
  private pendingSyncNotify = false

  // Element tracking for proper cleanup
  private elementsByIndex = new Map<number, Element>()

  // Smooth scroll state
  private currentSmoothScroll: SmoothScrollResult | null = null

  // Scroll listener management
  protected scrollElement: HTMLElement | null = null

  /**
   * Cached function for {@link handleScroll} getter — stable reference for `onScroll={virtualizer.handleScroll}`.
   * (Only `subscribe` / `getSnapshot` use class fields so `useSyncExternalStore` can pass them without `.bind`.)
   */
  private scrollHandler?: (event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }) => void

  /** Incremented when external-store subscribers (e.g. React useSyncExternalStore) should re-render. */
  private storeVersion = 0
  private storeListeners = new Set<VoidFunction>()

  constructor(options: O) {
    this.options = {
      horizontal: false,
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      initialOffset: 0,
      overscan: 3,
      rootMargin: "50px",
      preserveScrollAnchor: true,
      observeScrollElementSize: false,
      ...options,
    } as ResolvedBaseOptions & O

    this.scrollOffset = this.options.initialOffset
    this.initializeAdvancedFeatures()
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

  protected notifyStore(): void {
    this.storeVersion++
    for (const listener of this.storeListeners) {
      listener()
    }
  }

  private initializeAdvancedFeatures(): void {
    if (this.options.onVisibilityChange) {
      this.intersectionObserver = new IntersectionObserverManager({
        rootMargin: this.options.rootMargin,
      })
    }
  }

  private observeScrollElementSize(element: HTMLElement): void {
    this.scrollElementResizeCleanup?.()

    const { horizontal } = this.options
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
        this.setViewportSize(horizontal ? width : height)
        this.setCrossAxisSize(horizontal ? height : width)
      }
    })
  }

  // ============================================
  // Style Getters
  // ============================================

  /** Regular method (not a class field) so subclasses can override with `super`. */
  getContainerStyle(): CSSProperties {
    return {
      position: "relative",
      overflow: "auto",
      willChange: "scroll-position",
      WebkitOverflowScrolling: "touch",
      contain: "strict",
    }
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  getContentStyle(): CSSProperties {
    const totalSize = this.getTotalSize()
    const { horizontal } = this.options

    return {
      position: "relative",
      width: horizontal ? totalSize : "100%",
      height: horizontal ? "100%" : totalSize,
      pointerEvents: this.isScrolling ? "none" : "auto",
    }
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  getScrollHandler() {
    return this.handleScroll
  }

  abstract getItemState(virtualItem: VirtualItem): ItemState
  abstract getItemStyle(virtualItem: VirtualItem): CSSProperties

  // ============================================
  // Virtual Items
  // ============================================

  getVirtualItems(): VirtualItem[] {
    this.calculateRange()

    const { startIndex, endIndex } = this.range

    // Integer comparison — no string allocation
    if (startIndex === this.cachedRangeStart && endIndex === this.cachedRangeEnd) {
      return this.cachedVirtualItems
    }

    const newVirtualItems: VirtualItem[] = []

    // Lazy cleanup — only when cache grows too large
    const visibleCount = endIndex - startIndex + 1
    if (this.virtualItemObjectCache.size > visibleCount + 200) {
      for (const [index] of this.virtualItemObjectCache) {
        if (index < startIndex - 100 || index > endIndex + 100) {
          this.virtualItemObjectCache.delete(index)
        }
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const measurement = this.getMeasurement(i)
      const lane = this.getItemLane(i)
      const key = this.getItemKey(i)

      this.keyIndexCache.set(key, i)

      let cachedItem = this.virtualItemObjectCache.get(i)

      if (
        cachedItem &&
        cachedItem.key === key &&
        cachedItem.start === measurement.start &&
        cachedItem.size === measurement.size &&
        cachedItem.lane === lane
      ) {
        newVirtualItems.push(cachedItem)
      } else {
        const virtualItem: VirtualItem = cachedItem || {
          index: i,
          key,
          start: measurement.start,
          end: measurement.end,
          size: measurement.size,
          lane,
          measureElement: this.createMeasureElement(i),
        }

        if (cachedItem) {
          virtualItem.key = key
          virtualItem.start = measurement.start
          virtualItem.end = measurement.end
          virtualItem.size = measurement.size
          virtualItem.lane = lane
        }

        this.virtualItemObjectCache.set(i, virtualItem)
        newVirtualItems.push(virtualItem)
      }
    }

    this.cachedVirtualItems = newVirtualItems
    this.cachedRangeStart = startIndex
    this.cachedRangeEnd = endIndex

    // Reset dirty floor — all visible items have been recomputed from the Fenwick tree.
    // Subsequent calls can use the measureCache until the next measurement invalidation.
    this.measureCacheDirtyFrom = Infinity

    return newVirtualItems
  }

  // ============================================
  // Measurement hooks (implemented by subclasses)
  // ============================================

  protected abstract initializeMeasurements(): void
  protected abstract resetMeasurements(): void
  protected abstract getMeasurement(index: number): ItemMeasurement
  protected abstract getItemLane(index: number): number
  protected abstract findVisibleRange(viewportStart: number, viewportEnd: number): Range
  protected abstract findIndexAtOffset(offset: number): number
  abstract getTotalSize(): number

  protected onItemsChanged(): void {}

  protected onItemMeasured(index: number, size: number): boolean {
    const prevSize = this.itemSizeCache.get(index)
    if (prevSize === size) return false
    this.itemSizeCache.set(index, size)
    return true
  }

  protected onCrossAxisSizeChange(_size: number): void {}

  protected getKnownItemSize(_index: number): number | undefined {
    return undefined
  }

  protected getEstimatedSize(index: number, laneWidth?: number): number {
    return this.options.estimatedSize(index, laneWidth)
  }

  /**
   * Lazy invalidation — O(1) instead of O(k) Map iteration.
   * Sets a "dirty floor" index. getMeasurement checks this and recomputes on demand.
   */
  protected invalidateMeasurements(fromIndex: number = 0): void {
    this.lastCalculatedOffset = -1
    this.cachedRangeStart = -1
    this.cachedRangeEnd = -2
    this.measureCacheDirtyFrom = Math.min(this.measureCacheDirtyFrom, fromIndex)
  }

  protected getItemKey(index: number): string | number {
    return this.options.indexToKey?.(index) ?? index
  }

  protected getIndexForKey(key: string | number): number | undefined {
    const byUser = this.options.keyToIndex?.(key)
    if (byUser !== undefined) return byUser

    const cached = this.keyIndexCache.get(key)
    if (cached !== undefined) return cached

    for (let i = 0; i < this.options.count; i++) {
      if (this.getItemKey(i) === key) return i
    }
    return undefined
  }

  // ============================================
  // Range Calculation
  // ============================================

  protected calculateRange(): void {
    if (this.lastCalculatedOffset === this.scrollOffset && this.range.endIndex >= 0) {
      return
    }

    const { count, overscan } = this.options

    if (count === 0 || this.viewportSize === 0) {
      this.range = { startIndex: 0, endIndex: -1 }
      this.lastCalculatedOffset = this.scrollOffset
      return
    }

    const viewportStart = this.scrollOffset
    const viewportEnd = this.scrollOffset + this.viewportSize
    let { startIndex, endIndex } = this.findVisibleRange(viewportStart, viewportEnd)

    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(count - 1, endIndex + overscan)

    const newRange = { startIndex, endIndex }

    if (this.range.startIndex !== newRange.startIndex || this.range.endIndex !== newRange.endIndex) {
      this.range = newRange
      // Only notify after init() — before that, no scroll element is bound
      // and consumers haven't wired up rendering yet.
      if (this.scrollElement) {
        this.options.onRangeChange?.(this.range)
      }
    }

    this.lastCalculatedOffset = this.scrollOffset
  }

  // ============================================
  // Scroll Handling
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
    const { horizontal } = this.options
    const { scrollTop, scrollLeft } = getScrollPositionFromEvent(event)
    const offset = horizontal ? scrollLeft : scrollTop

    if (offset === this.scrollOffset) return

    this.prevScrollOffset = this.scrollOffset
    this.scrollOffset = offset

    const rawDirection = offset > this.prevScrollOffset ? "forward" : "backward"
    if (this.options.horizontal && this.options.rtl) {
      this.scrollDirection = rawDirection === "forward" ? "backward" : "forward"
    } else {
      this.scrollDirection = rawDirection
    }

    this.isScrolling = true

    // Process synchronously; React consumers subscribe via useSyncExternalStore.
    this.calculateRange()
    this.notifyScroll()

    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer)
    this.scrollEndTimer = setTimeout(() => {
      this.scrollEndTimer = null
      this.isScrolling = false
      this.notifyScroll()
      // Attach ResizeObservers for items mounted during scroll.
      // During fast scroll, observer setup is skipped to avoid overhead.
      // Now that scrolling stopped, observe all currently tracked elements
      // so future size changes (image load, accordion, etc.) are detected.
      this.observeUnobservedElements()
      this.notifyStore()
    }, SCROLL_END_DELAY_MS)

    this.notifyStore()
  }

  private notifyScroll(): void {
    const { horizontal } = this.options
    const offset: ScrollState["offset"] = horizontal ? { x: this.scrollOffset, y: 0 } : { x: 0, y: this.scrollOffset }
    const direction: ScrollState["direction"] = horizontal
      ? { x: this.scrollDirection, y: "idle" }
      : { x: "idle", y: this.scrollDirection }

    this.options.onScroll?.({
      offset,
      direction,
      isScrolling: this.isScrolling,
    })
  }

  // ============================================
  // Public API
  // ============================================

  /** Regular method (not a class field) so subclasses can override with `super`. */
  setViewportSize(size: number): void {
    this.viewportSize = size
    this.lastCalculatedOffset = -1
    this.cachedRangeStart = -1
    this.cachedRangeEnd = -2
    this.calculateRange()
    this.notifyStore()
  }

  setCrossAxisSize(size: number): void {
    const sizeChanged = this.crossAxisSize !== size
    this.crossAxisSize = size

    if (sizeChanged) {
      this.lastCalculatedOffset = -1
      this.cachedRangeStart = -1
      this.cachedRangeEnd = -2
      this.onCrossAxisSizeChange(size)
      this.calculateRange()
      this.notifyStore()
    }
  }

  measure(): void {
    if (!this.scrollElement) return

    const rect = this.scrollElement.getBoundingClientRect()
    const { horizontal } = this.options

    this.setViewportSize(horizontal ? rect.width : rect.height)
    this.setCrossAxisSize(horizontal ? rect.height : rect.width)
  }

  /**
   * When `false`, `scrollTo` only updates internal scroll state — the subclass scrolls the real container
   * (e.g. `window` or an overflow parent). Default `true` applies offset to `scrollElement`.
   */
  protected shouldApplyScrollToScrollElement(): boolean {
    return true
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  scrollTo(offset: number): { scrollTop?: number; scrollLeft?: number } {
    const { horizontal } = this.options
    const existing = this.scrollElement ? getScrollPosition(this.scrollElement) : { scrollTop: 0, scrollLeft: 0 }

    if (this.scrollElement && this.shouldApplyScrollToScrollElement()) {
      setScrollPosition(this.scrollElement, horizontal ? { scrollLeft: offset } : { scrollTop: offset })
    }

    this.prevScrollOffset = this.scrollOffset
    this.scrollOffset = offset

    const rawDirection = offset > this.prevScrollOffset ? "forward" : "backward"
    if (this.options.horizontal && this.options.rtl) {
      this.scrollDirection = rawDirection === "forward" ? "backward" : "forward"
    } else {
      this.scrollDirection = rawDirection
    }

    this.calculateRange()
    this.notifyScroll()
    this.notifyStore()

    if (horizontal) return { scrollLeft: offset, scrollTop: existing.scrollTop }
    return { scrollTop: offset, scrollLeft: existing.scrollLeft }
  }

  /**
   * Compute the list-space scroll offset for a given index + alignment.
   * Returns `null` when `align: "auto"` and the item is already visible.
   */
  protected resolveScrollToOffset(index: number, align: ScrollToIndexOptions["align"] = "start"): number | null {
    const { count } = this.options
    if (index < 0 || index >= count) return this.scrollOffset

    const measurement = this.getMeasurement(index)

    if (align === "auto") {
      const itemStart = measurement.start
      const itemEnd = measurement.end
      const viewportStart = this.scrollOffset
      const viewportEnd = this.scrollOffset + this.viewportSize

      if (itemStart < viewportStart) return itemStart
      if (itemEnd > viewportEnd) return itemEnd - this.viewportSize
      return null
    }

    let offset = measurement.start
    switch (align) {
      case "center":
        offset -= (this.viewportSize - measurement.size) / 2
        break
      case "end":
        offset -= this.viewportSize - measurement.size
        break
    }
    return Math.max(0, offset)
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  scrollToIndex(index: number, options: ScrollToIndexOptions = {}): ScrollToIndexResult {
    const { align = "start", smooth } = options

    const targetOffset = this.resolveScrollToOffset(index, align)
    if (targetOffset === null) {
      return this.options.horizontal ? { scrollLeft: this.scrollOffset } : { scrollTop: this.scrollOffset }
    }

    if (smooth) {
      return this.performSmoothScroll(targetOffset, smooth)
    }

    return this.scrollTo(targetOffset)
  }

  private performSmoothScroll(
    targetOffset: number,
    smoothOptions: boolean | NonNullable<ScrollToIndexOptions["smooth"]>,
  ): ScrollToIndexResult {
    const { horizontal } = this.options

    this.currentSmoothScroll?.cancel()

    const easeOutCubic = (t: number): number => --t * t * t + 1
    const defaultOptions = { duration: 600, easing: easeOutCubic }
    const options = smoothOptions === true ? defaultOptions : { ...defaultOptions, ...smoothOptions }

    const easingFn = typeof options.easing === "function" ? options.easing : easeOutCubic

    type ScrollFn = (position: { scrollTop?: number; scrollLeft?: number }) => void
    const userScrollFn =
      typeof smoothOptions === "object" && "scrollFunction" in smoothOptions
        ? (smoothOptions.scrollFunction as ScrollFn | undefined)
        : undefined

    const customScrollFunction: ScrollFn =
      userScrollFn ||
      ((position: { scrollTop?: number; scrollLeft?: number }) => {
        const newOffset = horizontal
          ? (position.scrollLeft ?? this.scrollOffset)
          : (position.scrollTop ?? this.scrollOffset)

        if (this.scrollElement) {
          setScrollPosition(this.scrollElement, { scrollTop: position.scrollTop, scrollLeft: position.scrollLeft })
        }

        this.prevScrollOffset = this.scrollOffset
        this.scrollOffset = newOffset

        const rawDirection = newOffset > this.prevScrollOffset ? "forward" : "backward"
        if (this.options.horizontal && this.options.rtl) {
          this.scrollDirection = rawDirection === "forward" ? "backward" : "forward"
        } else {
          this.scrollDirection = rawDirection
        }

        this.isScrolling = true

        this.calculateRange()
        this.notifyScroll()
        this.notifyStore()
      })

    const target = horizontal ? { x: targetOffset } : { y: targetOffset }

    if (!this.scrollElement) {
      throw new Error(
        "[@zag-js/virtualizer] Missing scroll element. Call `virtualizer.init(element)` before using smooth scrolling.",
      )
    }

    this.currentSmoothScroll = smoothScrollTo(this.scrollElement, target, {
      duration: options.duration,
      easing: easingFn,
      scrollFunction: customScrollFunction,
      onComplete: () => {
        this.currentSmoothScroll = null
        this.isScrolling = false
        this.notifyScroll()
        this.notifyStore()
      },
      onCancel: () => {
        this.currentSmoothScroll = null
        this.isScrolling = false
        this.notifyStore()
      },
    })

    return horizontal ? { scrollLeft: targetOffset } : { scrollTop: targetOffset }
  }

  measureItem(index: number, size: number): void {
    const changed = this.onItemMeasured(index, size)
    if (!changed) return

    if (this.options.preserveScrollAnchor && index <= this.range.startIndex) {
      this.preserveScrollPosition(index, () => {
        this.invalidateMeasurements(index)
      })
    } else {
      this.invalidateMeasurements(index)
    }
    this.calculateRange()
    this.notifyStore()
  }

  /**
   * Process a measurement synchronously in the ref callback.
   * Updates Fenwick tree + caches immediately.
   *
   * During scroll: the next handleScroll → calculateRange picks up updated sizes.
   * During idle (initial mount, no scroll): schedules a batched microtask notification
   * so positions correct without waiting for a scroll event.
   */
  private measureElementSync(index: number, size: number): void {
    const changed = this.onItemMeasured(index, size)
    if (!changed) return

    if (this.options.preserveScrollAnchor && index <= this.range.startIndex) {
      this.preserveScrollPosition(index, () => {
        this.invalidateMeasurements(index)
      })
    } else {
      this.invalidateMeasurements(index)
    }

    // During scroll, the next handleScroll → calculateRange picks up the updated
    // Fenwick tree. No extra notification needed — avoids double flushSync per frame.
    // During idle (initial mount), schedule a single batched notification so positions
    // correct without waiting for a scroll event.
    if (!this.isScrolling && !this.pendingSyncNotify) {
      this.pendingSyncNotify = true
      queueMicrotask(() => {
        this.pendingSyncNotify = false
        this.calculateRange()
        this.options.onRangeChange?.(this.range)
        this.measureCacheDirtyFrom = Infinity
        this.notifyStore()
      })
    }
  }

  /**
   * Schedule a size update via microtask batching.
   * Used for ResizeObserver callbacks (fire async, outside React commit phase).
   */
  scheduleSizeUpdate(index: number, size: number): void {
    this.pendingSizeUpdates.set(index, size)

    if (!this.sizeUpdateScheduled) {
      this.sizeUpdateScheduled = true
      queueMicrotask(() => {
        this.flushSizeUpdates()
      })
    }
  }

  private flushSizeUpdates(): void {
    if (this.pendingSizeUpdates.size === 0) {
      this.sizeUpdateScheduled = false
      return
    }

    const prevRange = { ...this.range }
    let anySizeChanged = false
    let minIndex = Infinity

    for (const [index, size] of this.pendingSizeUpdates) {
      if (this.onItemMeasured(index, size)) {
        anySizeChanged = true
        if (index < minIndex) minIndex = index
      }
    }

    this.pendingSizeUpdates.clear()
    this.sizeUpdateScheduled = false

    if (!anySizeChanged) return

    if (this.options.preserveScrollAnchor && minIndex <= this.range.startIndex) {
      this.preserveScrollPosition(minIndex, () => {
        this.invalidateMeasurements(minIndex)
      })
    } else {
      this.invalidateMeasurements(minIndex)
    }

    this.calculateRange()

    // Notify even when range indices didn't change — sizes changed, items need repositioning
    const rangeNotified = prevRange.startIndex !== this.range.startIndex || prevRange.endIndex !== this.range.endIndex
    if (!rangeNotified) {
      this.options.onRangeChange?.(this.range)
    }

    // Reset dirty floor AFTER notification — React subscribers re-render while
    // measureCacheDirtyFrom must still be set so getMeasurement misses stale cache until then
    this.measureCacheDirtyFrom = Infinity
    this.notifyStore()
  }

  /**
   * Preserve scroll position during updates that change measurements.
   * Skips anchor queries when measured item is below anchor (common case during downward scroll).
   */
  private preserveScrollPosition(fromIndex: number, callback: VoidFunction): void {
    if (!this.options.preserveScrollAnchor || this.range.startIndex < 0) {
      callback()
      return
    }

    const anchorIndex = this.range.startIndex

    // Items below the anchor don't affect anchor offset
    if (fromIndex > anchorIndex) {
      callback()
      return
    }

    const anchorMeasurement = this.getMeasurement(anchorIndex)
    const anchorOffset = anchorMeasurement.start

    callback()

    const newAnchorMeasurement = this.getMeasurement(anchorIndex)
    const deltaOffset = newAnchorMeasurement.start - anchorOffset

    if (deltaOffset !== 0) {
      this.scrollOffset += deltaOffset
      // Also update the DOM scroll position to stay in sync
      if (this.scrollElement) {
        if (this.options.horizontal) {
          this.scrollElement.scrollLeft += deltaOffset
        } else {
          this.scrollElement.scrollTop += deltaOffset
        }
      }
    }
  }

  getScrollState(): ScrollState {
    const { horizontal } = this.options
    const offset: ScrollState["offset"] = horizontal ? { x: this.scrollOffset, y: 0 } : { x: 0, y: this.scrollOffset }
    const direction: ScrollState["direction"] = horizontal
      ? { x: this.scrollDirection, y: "idle" }
      : { x: "idle", y: this.scrollDirection }
    return { offset, direction, isScrolling: this.isScrolling }
  }

  getScrollAnchor(): ScrollAnchor | null {
    this.calculateRange()
    if (this.range.startIndex < 0 || this.range.endIndex < 0) return null

    const anchorIndex = this.range.startIndex
    const measurement = this.getMeasurement(anchorIndex)
    const key = this.getItemKey(anchorIndex)

    return { key, offset: this.scrollOffset - measurement.start }
  }

  restoreScrollAnchor(anchor: ScrollAnchor): ScrollToIndexResult | null {
    const index = this.getIndexForKey(anchor.key)
    if (index === undefined) return null

    const measurement = this.getMeasurement(index)
    const targetOffset = measurement.start + anchor.offset
    return this.scrollTo(Math.max(0, targetOffset))
  }

  getRange(): Range {
    return { ...this.range }
  }

  forceUpdate(): void {
    this.lastCalculatedOffset = -1
    this.cachedRangeStart = -1
    this.cachedRangeEnd = -2
    this.measureCacheDirtyFrom = 0
    this.measureCache.clear()
    this.resetMeasurements()
    this.calculateRange()
    this.notifyStore()
  }

  /**
   * Create a measureElement ref callback for a virtual item.
   * Measures synchronously via getBoundingClientRect (fast, in React commit phase).
   * Sets up ResizeObserver for future size changes only — initial measurement is
   * written to itemSizeCache first, so the ResizeObserver callback short-circuits.
   */
  private createMeasureElement(index: number): (element: HTMLElement | null) => void {
    return (element: HTMLElement | null) => {
      const prevElement = this.elementsByIndex.get(index)

      if (prevElement && prevElement !== element) {
        this.unobserveElement(prevElement)
        this.elementsByIndex.delete(index)
      }

      if (element) {
        this.elementsByIndex.set(index, element)

        // Measure synchronously in the ref callback — updates Fenwick tree
        // immediately for correct positioning on the next render.
        const { horizontal } = this.options
        const size = horizontal ? element.offsetWidth : element.offsetHeight

        if (size > 0) {
          const knownSize = this.getKnownItemSize(index)
          if (knownSize === undefined || knownSize !== size) {
            // Write to itemSizeCache so ResizeObserver's initial callback
            // sees the same size and becomes a no-op.
            this.itemSizeCache.set(index, size)
            this.measureElementSync(index, size)
          }
        }

        // ResizeObserver handles future size changes (content resize after mount).
        // Only set up during idle — not during fast scroll to avoid observer overhead.
        if (!this.isScrolling) {
          this.observeElementSize(element, index)
        }
      } else {
        this.elementsByIndex.delete(index)
      }
    }
  }

  observeElementSize(element: Element, index: number): void {
    this.unobserveElementResize(element)

    const cleanup = resizeObserverBorderBox.observe(element, (entry) => {
      const { borderBoxSize } = entry
      const box = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }
      const measuredSize = this.options.horizontal ? box.inlineSize : box.blockSize
      const knownSize = this.getKnownItemSize(index)
      if (knownSize === undefined || knownSize !== measuredSize) {
        this.scheduleSizeUpdate(index, measuredSize)
      }
    })

    this.resizeObserverCleanups.set(element, cleanup)
  }

  /**
   * Attach ResizeObservers for elements that were mounted during fast scroll
   * (when observer setup was skipped for perf). Called when scrolling ends.
   */
  private observeUnobservedElements(): void {
    for (const [index, element] of this.elementsByIndex) {
      if (!this.resizeObserverCleanups.has(element)) {
        this.observeElementSize(element, index)
      }
    }
  }

  observeElementVisibility(element: Element, index: number): void {
    if (!this.intersectionObserver) return
    this.intersectionObserver.observe(element, (isVisible) => {
      this.options.onVisibilityChange?.(index, isVisible)
    })
  }

  private unobserveElementResize(element: Element): void {
    const cleanup = this.resizeObserverCleanups.get(element)
    if (cleanup) {
      cleanup()
      this.resizeObserverCleanups.delete(element)
    }
  }

  unobserveElement(element: Element): void {
    this.unobserveElementResize(element)
    this.intersectionObserver?.unobserve(element)
  }

  // ============================================
  // Smooth Scrolling API
  // ============================================

  smoothScrollTo(
    offset: number,
    options: {
      duration?: number
      easing?: ScrollToIndexOptions["smooth"] extends object ? ScrollToIndexOptions["smooth"]["easing"] : never
      scrollFunction?: (position: { scrollTop?: number; scrollLeft?: number }) => void
    } = {},
  ): ScrollToIndexResult {
    return this.performSmoothScroll(offset, options)
  }

  cancelSmoothScroll(): void {
    this.currentSmoothScroll?.cancel()
  }

  isSmoothScrolling(): boolean {
    return this.currentSmoothScroll !== null
  }

  setScrollElement(element: Element): void {
    if (isHTMLElement(element)) {
      this.init(element)
    }
  }

  updateOptions(nextOptions: Partial<O>): void {
    const prev = { ...this.options }

    Object.assign(this.options, nextOptions)

    // Check if anything actually changed
    let changed = false
    for (const key in nextOptions) {
      if ((prev as any)[key] !== (this.options as any)[key]) {
        changed = true
        break
      }
    }

    if (!changed) return

    if (nextOptions.count !== undefined && nextOptions.count !== prev.count) {
      this.onItemsChanged()
    }

    this.forceUpdate()
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  destroy(): void {
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer)

    for (const cleanup of this.resizeObserverCleanups.values()) {
      cleanup()
    }
    this.resizeObserverCleanups.clear()

    this.scrollElementResizeCleanup?.()
    this.intersectionObserver?.disconnect()
    this.cancelSmoothScroll()

    this.measureCache.clear()
    this.pendingSizeUpdates.clear()
    this.elementsByIndex.clear()
    this.storeListeners.clear()
  }
}
