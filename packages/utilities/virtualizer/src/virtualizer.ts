import type {
  CSSProperties,
  ItemState,
  OverscanConfig,
  Range,
  ScrollAnchor,
  ScrollHistoryEntry,
  ScrollRestorationConfig,
  ScrollState,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  VirtualItem,
  VirtualizerOptions,
} from "./types"
import { SizeObserver } from "./utils/size-observer"
import { IntersectionObserverManager } from "./utils/intersection-observer-manager"
import { resolveOverscanConfig, SCROLL_END_DELAY_MS } from "./utils/overscan"
import { ResizeObserverManager } from "./utils/resize-observer-manager"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"
import { ScrollRestorationManager } from "./utils/scroll-restoration-manager"
import { easingFunctions, smoothScrollTo, type SmoothScrollResult } from "./utils/smooth-scroll"
import { VelocityTracker, type OverscanCalculationResult, type VelocityState } from "./utils/velocity-tracker"
import { debounce, rafThrottle } from "./utils/debounce"
import { shallowCompare } from "./utils/shallow-compare"

type ResolvedBaseOptions = Required<
  Omit<
    VirtualizerOptions,
    "onScroll" | "onRangeChange" | "onVisibilityChange" | "onScrollElementResize" | "overscan" | "scrollRestoration"
  >
> &
  Pick<VirtualizerOptions, "onScroll" | "onRangeChange" | "onVisibilityChange" | "onScrollElementResize"> & {
    overscan: Required<OverscanConfig>
    scrollRestoration?: ScrollRestorationConfig
  }

/**
 * Shared logic for all virtualizer variants (list, grid, table, masonry).
 * Layout-specific classes implement measurement and range calculation details.
 */
export abstract class Virtualizer<O extends VirtualizerOptions = VirtualizerOptions> {
  protected options: ResolvedBaseOptions & O

  // Measurements
  protected measureCache: Map<number, { start: number; size: number; end: number }> = new Map()
  protected itemSizeCache: Map<number, number> = new Map()

  // Scroll state
  protected scrollOffset = 0
  protected prevScrollOffset = 0
  protected scrollDirection: "forward" | "backward" = "forward"
  protected isScrolling = false
  protected scrollEndTimer: ReturnType<typeof setTimeout> | null = null
  private debouncedScrollEnd: ReturnType<typeof debounce> | null = null
  private rafUpdateRange: ReturnType<typeof rafThrottle> | null = null

  // Viewport
  protected viewportSize = 0
  // Cross-axis size of the scroll element (width for vertical, height for horizontal).
  protected crossAxisSize = 0

  // Visible range
  protected range: Range = { startIndex: 0, endIndex: -1 }
  private lastCalculatedOffset: number = -1
  private cachedVirtualItems: VirtualItem[] = []
  private virtualItemsCacheKey: string = ""
  private virtualItemObjectCache: Map<number, VirtualItem> = new Map()
  private keyIndexCache: Map<string | number, number> = new Map()

  // Advanced features
  private velocityTracker?: VelocityTracker
  private resizeObserver?: ResizeObserverManager
  private intersectionObserver?: IntersectionObserverManager
  private sizeObserver?: SizeObserver
  private scrollRestoration?: ScrollRestorationManager

  // Dynamic sizing
  private pendingSizeUpdates = new Map<number, number>()
  private sizeUpdateScheduled = false

  // Element tracking for proper cleanup
  private elementsByIndex = new Map<number, Element>()

  // Smooth scroll state
  private currentSmoothScroll: SmoothScrollResult | null = null

  // Scroll listener management
  protected scrollElement: Element | null = null

  constructor(options: O) {
    const overscan = resolveOverscanConfig(options.overscan)

    this.options = {
      horizontal: false,
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      initialOffset: 0,
      rootMargin: "50px",
      preserveScrollAnchor: true,
      observeScrollElementSize: false,
      ...options,
      overscan,
    } as ResolvedBaseOptions & O

    this.scrollOffset = this.options.initialOffset
    this.initializeScrollHandlers()
    this.initializeAdvancedFeatures()
    this.initializeMeasurements()
    // Don't attach scroll listener in constructor since DOM may not be ready
  }

  /**
   * Initialize the virtualizer with a concrete scroll element.
   *
   * This avoids the common "ref is null during construction" issue by allowing
   * consumers to wire the element explicitly once it mounts.
   */
  init(scrollElement: HTMLElement): void {
    // If we were previously attached to a different element (or window), detach first.
    if (this.scrollElement && this.scrollElement !== scrollElement) {
      this.detachScrollListener()
    }

    this.scrollElement = scrollElement
    this.scrollListenerAttached = false

    // Observe size if enabled
    this.initializeScrollingElement()

    // Prime measurements
    this.measure()

    // Attach listener eagerly now that we have the element
    this.attachScrollListener()
  }

  private initializeScrollHandlers(): void {
    // Create debounced scroll end handler
    this.debouncedScrollEnd = debounce(() => {
      this.isScrolling = false
      this.notifyScroll()

      // Record scroll position when scrolling stops (user interaction)
      this.scrollRestoration?.recordScrollPosition(this.scrollOffset, "user")
    }, SCROLL_END_DELAY_MS)

    // Create RAF-throttled range update for smooth scrolling
    this.rafUpdateRange = rafThrottle((fn: () => void) => fn())
  }

  private initializeAdvancedFeatures(): void {
    const { horizontal, overscan } = this.options

    // Initialize velocity tracker for dynamic overscan
    if (overscan.dynamic) {
      this.velocityTracker = new VelocityTracker()
    }

    // Initialize resize observer
    this.resizeObserver = new ResizeObserverManager()

    // Initialize intersection observer for visibility tracking
    if (this.options.onVisibilityChange) {
      this.intersectionObserver = new IntersectionObserverManager({
        rootMargin: this.options.rootMargin,
      })
    }

    // Observe scroll element size
    if (this.options.observeScrollElementSize) {
      this.sizeObserver = new SizeObserver({
        onResize: (size) => {
          const viewportSize = horizontal ? size.width : size.height
          const crossAxisSize = horizontal ? size.height : size.width

          this.setViewportSize(viewportSize)
          this.setCrossAxisSize(crossAxisSize)

          // Record resize in scroll restoration
          this.scrollRestoration?.handleResize(this.scrollOffset)

          // Notify user of scroll element resize
          this.options.onScrollElementResize?.(size)
        },
      })

      // Scroll element size observation is wired during `init(element)`
      this.initializeScrollingElement()
    }

    // Initialize scroll restoration if enabled
    if (this.options.scrollRestoration) {
      const { scrollRestoration } = this.options
      this.scrollRestoration = new ScrollRestorationManager({
        enableScrollRestoration: true,
        maxHistoryEntries: scrollRestoration.maxEntries ?? 10,
        restorationKey: scrollRestoration.key ?? "default",
        restorationTolerance: scrollRestoration.tolerance ?? 5,
      })
    }
  }

  // ============================================
  // Style Getters
  // ============================================

  /**
   * Get container element styles
   */
  getContainerStyle(): CSSProperties {
    return {
      position: "relative",
      overflow: "auto",
      willChange: "scroll-position",
      WebkitOverflowScrolling: "touch",
      contain: "strict",
    }
  }

  /**
   * Get content/spacer element styles
   */
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

  /**
   * Get scroll handler for container
   */
  getScrollHandler() {
    return this.handleScroll
  }

  /**
   * Get item state data (position, size, etc.)
   */
  abstract getItemState(virtualItem: VirtualItem): ItemState

  /**
   * Get item element styles
   */
  abstract getItemStyle(virtualItem: VirtualItem): CSSProperties

  // ============================================
  // Virtual Items
  // ============================================

  /**
   * Compute all virtual items that should be rendered
   * Uses caching to avoid redundant calculations (like TanStack Virtual)
   */
  getVirtualItems(): VirtualItem[] {
    this.calculateRange()

    const { startIndex, endIndex } = this.range

    // Cache key based on range - if range hasn't changed, return cached items
    const newCacheKey = `${startIndex}:${endIndex}`
    if (newCacheKey === this.virtualItemsCacheKey) {
      return this.cachedVirtualItems
    }

    const newVirtualItems: VirtualItem[] = []

    // Clean up virtual item cache for items outside new range
    for (const [index] of this.virtualItemObjectCache) {
      if (index < startIndex - 100 || index > endIndex + 100) {
        this.virtualItemObjectCache.delete(index)
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const measurement = this.getMeasurement(i)
      const lane = this.getItemLane(i)
      const key = this.getItemKey(i)

      // Track key -> index mapping for fast anchor restoration in common cases
      this.keyIndexCache.set(key, i)

      // Try to reuse cached virtual item object
      let cachedItem = this.virtualItemObjectCache.get(i)

      if (
        cachedItem &&
        cachedItem.key === key &&
        cachedItem.start === measurement.start &&
        cachedItem.size === measurement.size &&
        cachedItem.lane === lane
      ) {
        // Reuse cached item object - no allocation
        newVirtualItems.push(cachedItem)
      } else {
        // Create or update virtual item
        const virtualItem: VirtualItem = cachedItem || {
          index: i,
          key,
          start: measurement.start,
          end: measurement.end,
          size: measurement.size,
          lane,
          measureElement: this.createMeasureElement(i),
        }

        // Update properties if reusing object
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

    // Cache the result
    this.cachedVirtualItems = newVirtualItems
    this.virtualItemsCacheKey = newCacheKey

    return newVirtualItems
  }

  // ============================================
  // Measurement hooks (implemented by subclasses)
  // ============================================

  protected abstract initializeMeasurements(): void
  protected abstract resetMeasurements(): void
  protected abstract getMeasurement(index: number): { start: number; size: number; end: number }
  protected abstract getItemLane(index: number): number
  protected abstract findVisibleRange(viewportStart: number, viewportEnd: number): Range
  protected abstract findIndexAtOffset(offset: number): number
  abstract getTotalSize(): number
  protected onItemsChanged(): void {
    // Optionally overridden by subclasses that need to rebuild caches when data changes
  }
  protected onItemMeasured(index: number, size: number): boolean {
    // Cache the measured size for future use
    const prevSize = this.itemSizeCache.get(index)
    if (prevSize === size) return false

    this.itemSizeCache.set(index, size)
    // Invalidate virtual item cache for this index
    this.virtualItemObjectCache.delete(index)
    return true
  }
  protected onCrossAxisSizeChange(_size: number): void {
    // Optionally overridden by subclasses that depend on cross-axis size (e.g., masonry)
  }
  protected getKnownItemSize(_index: number): number | undefined {
    // Optionally overridden by subclasses to return the currently known size for an item
    // Used to skip redundant size updates
    return undefined
  }

  /**
   * Get the estimated size for an item at the given index
   */
  protected getEstimatedSize(index: number, laneWidth?: number): number {
    return this.options.estimatedSize(index, laneWidth)
  }

  protected invalidateMeasurements(fromIndex: number = 0) {
    this.lastCalculatedOffset = -1 // Invalidate range cache
    this.virtualItemsCacheKey = "" // Invalidate items cache
    for (const key of this.measureCache.keys()) {
      if (key >= fromIndex) {
        this.measureCache.delete(key)
        this.itemSizeCache.delete(key)
        this.virtualItemObjectCache.delete(key)
      }
    }
    // Key cache is no longer trustworthy after invalidation
    this.keyIndexCache.clear()
  }

  /**
   * Resolve the stable key for an index.
   */
  protected getItemKey(index: number): string | number {
    return this.options.indexToKey?.(index) ?? index
  }

  /**
   * Attempt to resolve an index for a key.
   * - Prefers user-provided inverse map
   * - Falls back to recent key cache
   * - Finally falls back to a linear scan (correct but O(n))
   */
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

  /**
   * Calculate visible range and apply overscan
   * Optimized with caching and shallow comparison
   */
  protected calculateRange(): void {
    // Skip if already calculated for this scroll offset (avoid double calculation)
    if (this.lastCalculatedOffset === this.scrollOffset && this.range.endIndex >= 0) {
      return
    }

    const { count, overscan, horizontal, rtl } = this.options

    if (count === 0 || this.viewportSize === 0) {
      this.range = { startIndex: 0, endIndex: -1 }
      this.lastCalculatedOffset = this.scrollOffset
      return
    }

    // Try to attach scroll listener if not already attached (lazy initialization)
    this.attachScrollListener()

    if (overscan.dynamic) {
      this.velocityTracker?.update(this.scrollOffset, horizontal && rtl)
    }

    // Calculate the visible range
    const viewportStart = this.scrollOffset
    const viewportEnd = this.scrollOffset + this.viewportSize
    let { startIndex, endIndex } = this.findVisibleRange(viewportStart, viewportEnd)

    // Apply overscan
    let leadingOverscan = overscan.count
    let trailingOverscan = overscan.count

    if (overscan.dynamic && this.velocityTracker) {
      const overscanResult = this.getCurrentOverscan()
      if (overscanResult) {
        leadingOverscan = overscanResult.leading
        trailingOverscan = overscanResult.trailing
      }
    }

    const overscanStart = leadingOverscan
    const overscanEnd = trailingOverscan

    startIndex = Math.max(0, startIndex - overscanStart)
    endIndex = Math.min(count - 1, endIndex + overscanEnd)

    const newRange = { startIndex, endIndex }
    const rangeChanged = !shallowCompare(this.range, newRange)

    if (rangeChanged) {
      this.range = newRange
      this.options.onRangeChange?.(this.range)
    }

    this.lastCalculatedOffset = this.scrollOffset
  }

  /**
   * Get average item size for overscan calculations
   * Uses estimatedSize for performance - accurate enough for overscan
   */
  private getAverageItemSize(): number {
    return this.getEstimatedSize(0)
  }

  // ============================================
  // Scroll Handling
  // ============================================

  handleScroll = (event: Event | { currentTarget: { scrollTop: number; scrollLeft: number } }): void => {
    const { horizontal } = this.options
    const { scrollTop, scrollLeft } = getScrollPositionFromEvent(event)
    const offset = horizontal ? scrollLeft : scrollTop

    // Quick exit if offset hasn't changed
    if (offset === this.scrollOffset) return

    this.prevScrollOffset = this.scrollOffset
    this.scrollOffset = offset

    // Calculate scroll direction (considering RTL for horizontal scroll)
    const rawDirection = offset > this.prevScrollOffset ? "forward" : "backward"
    if (this.options.horizontal && this.options.rtl) {
      // In RTL horizontal mode, increasing offset means moving backward
      this.scrollDirection = rawDirection === "forward" ? "backward" : "forward"
    } else {
      this.scrollDirection = rawDirection
    }

    const wasScrolling = this.isScrolling
    this.isScrolling = true

    // Use RAF throttling for smoother updates during fast scrolling
    if (this.rafUpdateRange) {
      this.rafUpdateRange(() => {
        this.calculateRange()
        this.notifyScroll()
      })
    } else {
      // Fallback to immediate calculation
      this.calculateRange()
      this.notifyScroll()
    }

    // Debounced scroll end detection
    if (this.debouncedScrollEnd) {
      this.debouncedScrollEnd()
    } else if (!wasScrolling) {
      // First scroll event - notify immediately
      this.notifyScroll()
    }
  }

  private notifyScroll(): void {
    this.options.onScroll?.({
      offset: this.scrollOffset,
      direction: this.scrollDirection,
      isScrolling: this.isScrolling,
    })
  }

  // ============================================
  // Public API
  // ============================================

  setViewportSize(size: number): void {
    this.viewportSize = size
    this.lastCalculatedOffset = -1 // Invalidate range cache
    this.virtualItemsCacheKey = "" // Invalidate items cache
    this.calculateRange()
  }

  setCrossAxisSize(size: number): void {
    const sizeChanged = this.crossAxisSize !== size
    this.crossAxisSize = size

    if (sizeChanged) {
      this.lastCalculatedOffset = -1 // Invalidate range cache
      this.virtualItemsCacheKey = "" // Invalidate items cache
      this.onCrossAxisSizeChange(size)
      this.calculateRange()
    }
  }

  /**
   * Measure the scroll container and set viewport/container sizes.
   */
  measure(): void {
    if (!this.scrollElement) return

    const rect = this.scrollElement.getBoundingClientRect()
    const { horizontal } = this.options

    this.setViewportSize(horizontal ? rect.width : rect.height)
    this.setCrossAxisSize(horizontal ? rect.height : rect.width)
  }

  scrollTo(offset: number): { scrollTop?: number; scrollLeft?: number } {
    const { horizontal } = this.options
    this.scrollOffset = offset

    // Record programmatic scroll
    this.scrollRestoration?.recordScrollPosition(offset, "programmatic")

    return horizontal ? { scrollLeft: offset } : { scrollTop: offset }
  }

  scrollToIndex(index: number, options: ScrollToIndexOptions = {}): ScrollToIndexResult {
    const { align = "start", smooth } = options
    const { count } = this.options

    if (index < 0 || index >= count) {
      return this.scrollTo(this.scrollOffset)
    }

    const measurement = this.getMeasurement(index)
    let offset = measurement.start

    switch (align) {
      case "center":
        offset -= (this.viewportSize - measurement.size) / 2
        break
      case "end":
        offset -= this.viewportSize - measurement.size
        break
    }

    const targetOffset = Math.max(0, offset)

    // Use smooth scrolling if requested
    if (smooth) {
      return this.performSmoothScroll(targetOffset, smooth)
    }

    return this.scrollTo(targetOffset)
  }

  /**
   * Perform smooth scrolling to target offset
   */
  private performSmoothScroll(
    targetOffset: number,
    smoothOptions: boolean | NonNullable<ScrollToIndexOptions["smooth"]>,
  ): ScrollToIndexResult {
    const { horizontal } = this.options

    // Cancel any existing smooth scroll
    this.currentSmoothScroll?.cancel()

    // Default smooth scroll options
    const defaultOptions = {
      duration: 600,
      easing: "easeOutCubic" as const,
    }

    const options = smoothOptions === true ? defaultOptions : { ...defaultOptions, ...smoothOptions }

    // Get the easing function
    let easingFn: (t: number) => number
    if (typeof options.easing === "string") {
      easingFn = easingFunctions[options.easing]
    } else {
      easingFn = options.easing
    }

    // Create custom scroll function that updates our internal state
    const customScrollFunction =
      ("scrollFunction" in options ? options.scrollFunction : undefined) ||
      ((position: { scrollTop?: number; scrollLeft?: number }) => {
        const newOffset = horizontal
          ? (position.scrollLeft ?? this.scrollOffset)
          : (position.scrollTop ?? this.scrollOffset)

        // Update our internal scroll state
        this.prevScrollOffset = this.scrollOffset
        this.scrollOffset = newOffset

        // Calculate scroll direction (considering RTL for horizontal scroll)
        const rawDirection = newOffset > this.prevScrollOffset ? "forward" : "backward"
        if (this.options.horizontal && this.options.rtl) {
          // In RTL horizontal mode, increasing offset means moving backward
          this.scrollDirection = rawDirection === "forward" ? "backward" : "forward"
        } else {
          this.scrollDirection = rawDirection
        }

        this.isScrolling = true

        // Update velocity tracking
        if (this.velocityTracker) {
          this.velocityTracker.update(newOffset, this.options.horizontal && this.options.rtl)
        }

        // Notify scroll change and recalculate range
        this.notifyScroll()
        this.calculateRange()
      })

    // Create target position object
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

        // Record the final position
        this.scrollRestoration?.recordScrollPosition(this.scrollOffset, "programmatic")

        this.notifyScroll()
      },
      onCancel: () => {
        this.currentSmoothScroll = null
        this.isScrolling = false
      },
    })

    return horizontal ? { scrollLeft: targetOffset } : { scrollTop: targetOffset }
  }

  measureItem(index: number, size: number): void {
    if (this.options.preserveScrollAnchor) {
      this.preserveScrollPosition(() => {
        this.onItemMeasured(index, size)
        this.invalidateMeasurements(index)
      })
    } else {
      this.onItemMeasured(index, size)
      this.invalidateMeasurements(index)
    }
    this.calculateRange()
  }

  /**
   * Schedule a size update with batching for smoother updates
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

  /**
   * Flush all pending size updates
   */
  private flushSizeUpdates(): void {
    if (this.pendingSizeUpdates.size === 0) {
      this.sizeUpdateScheduled = false
      return
    }

    // Capture range before updates
    const prevRange = { ...this.range }
    let anySizeChanged = false

    if (this.options.preserveScrollAnchor) {
      this.preserveScrollPosition(() => {
        for (const [index, size] of this.pendingSizeUpdates) {
          if (this.onItemMeasured(index, size)) {
            anySizeChanged = true
          }
        }
        if (anySizeChanged) {
          this.invalidateMeasurements(Math.min(...this.pendingSizeUpdates.keys()))
        }
      })
    } else {
      for (const [index, size] of this.pendingSizeUpdates) {
        if (this.onItemMeasured(index, size)) {
          anySizeChanged = true
        }
      }
      if (anySizeChanged) {
        this.invalidateMeasurements(Math.min(...this.pendingSizeUpdates.keys()))
      }
    }

    this.pendingSizeUpdates.clear()
    this.sizeUpdateScheduled = false

    // Only recalculate and notify if sizes actually changed
    if (anySizeChanged) {
      this.calculateRange()

      // Notify after measurements change so consumers can re-render
      // calculateRange only notifies when range indices change, but we need to
      // notify even when just sizes change (same indices, different measurements)
      const rangeNotified = prevRange.startIndex !== this.range.startIndex || prevRange.endIndex !== this.range.endIndex
      if (!rangeNotified) {
        this.options.onRangeChange?.(this.range)
      }
    }
  }

  /**
   * Preserve scroll position during updates that change measurements
   */
  private preserveScrollPosition(callback: () => void): void {
    if (!this.options.preserveScrollAnchor || this.range.startIndex < 0) {
      callback()
      return
    }

    // Find anchor item (first visible item)
    const anchorIndex = this.range.startIndex
    const anchorMeasurement = this.getMeasurement(anchorIndex)
    const anchorOffset = anchorMeasurement.start

    // Execute the update
    callback()

    // Restore scroll position relative to anchor
    const newAnchorMeasurement = this.getMeasurement(anchorIndex)
    const newAnchorOffset = newAnchorMeasurement.start
    const deltaOffset = newAnchorOffset - anchorOffset

    if (deltaOffset !== 0) {
      this.scrollOffset += deltaOffset
    }
  }

  getScrollState(): ScrollState {
    return {
      offset: this.scrollOffset,
      direction: this.scrollDirection,
      isScrolling: this.isScrolling,
    }
  }

  /**
   * Capture an anchor representing "what the user is looking at".
   * This is key-based, so it can survive insertions/removals if keys are stable.
   */
  getScrollAnchor(): ScrollAnchor | null {
    this.calculateRange()
    if (this.range.startIndex < 0 || this.range.endIndex < 0) return null

    const anchorIndex = this.range.startIndex
    const measurement = this.getMeasurement(anchorIndex)
    const key = this.getItemKey(anchorIndex)

    return {
      key,
      offset: this.scrollOffset - measurement.start,
    }
  }

  /**
   * Restore scroll position so that the anchor item is at the same intra-item offset.
   */
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
    this.lastCalculatedOffset = -1 // Invalidate range cache
    this.virtualItemsCacheKey = "" // Invalidate items cache
    this.resetMeasurements()
    this.calculateRange()
  }

  /**
   * Create a measureElement callback for a virtual item
   * Handles both observing new elements and cleaning up old ones
   */
  private createMeasureElement(index: number): (element: HTMLElement | null) => void {
    return (element: HTMLElement | null) => {
      // Get the previously tracked element for this index
      const prevElement = this.elementsByIndex.get(index)

      // Clean up previous element if it exists and is different
      if (prevElement && prevElement !== element) {
        this.unobserveElement(prevElement)
        this.elementsByIndex.delete(index)
      }

      if (element) {
        // Track and observe the new element
        this.elementsByIndex.set(index, element)

        // Immediately measure and update size (only if changed)
        const { horizontal } = this.options
        const rect = element.getBoundingClientRect()
        const size = horizontal ? rect.width : rect.height
        if (size > 0) {
          const knownSize = this.getKnownItemSize(index)
          if (knownSize === undefined || knownSize !== size) {
            this.scheduleSizeUpdate(index, size)
          }
        }

        // Set up observer for future size changes
        this.observeElementSize(element, index)
      } else {
        // Element is null (unmounting), cleanup tracking
        this.elementsByIndex.delete(index)
      }
    }
  }

  /**
   * Observe element for size changes
   */
  observeElementSize(element: Element, index: number): void {
    if (!this.resizeObserver) return

    this.resizeObserver.observe(element, (size) => {
      const measuredSize = this.options.horizontal ? size.width : size.height
      // Only schedule update if size actually changed
      const knownSize = this.getKnownItemSize(index)
      if (knownSize === undefined || knownSize !== measuredSize) {
        this.scheduleSizeUpdate(index, measuredSize)
      }
    })
  }

  /**
   * Observe element for visibility changes
   */
  observeElementVisibility(element: Element, index: number): void {
    if (!this.intersectionObserver) return

    this.intersectionObserver.observe(element, (isVisible) => {
      this.options.onVisibilityChange?.(index, isVisible)
    })
  }

  /**
   * Stop observing element
   */
  unobserveElement(element: Element): void {
    this.resizeObserver?.unobserve(element)
    this.intersectionObserver?.unobserve(element)
  }

  /**
   * Initialize scrolling element observation
   */
  private initializeScrollingElement(): void {
    if (!this.sizeObserver) return

    if (this.scrollElement) {
      this.sizeObserver.observe(this.scrollElement)
    }
  }

  /**
   * Attach scroll listener to scrolling element
   */
  protected scrollListenerAttached = false
  protected attachScrollListener(): void {
    if (this.scrollListenerAttached) return
    if (typeof window === "undefined") return

    if (!this.scrollElement) {
      throw new Error(
        "[@zag-js/virtualizer] Missing scroll element. Call `virtualizer.init(element)` before reading virtual items. For window scrolling, use `WindowVirtualizer`.",
      )
    }

    this.scrollElement.addEventListener("scroll", this.handleScroll, { passive: true })
    this.scrollListenerAttached = true
  }

  /**
   * Remove scroll listener from container element
   */
  protected detachScrollListener(): void {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener("scroll", this.handleScroll)
      this.scrollElement = null
      this.scrollListenerAttached = false
    }
  }

  /**
   * Get current scroll element size (observeScrollElementSize only)
   */
  getScrollElementSize(): { width: number; height: number } | null {
    if (!this.sizeObserver) return null
    return this.sizeObserver.getCurrentSize()
  }

  /**
  // Scroll Restoration API
  // ============================================

  /**
   * Restore scroll position from history
   */
  restoreScrollPosition(): ScrollToIndexResult | null {
    if (!this.scrollRestoration) return null

    const restoration = this.scrollRestoration.getRestorationPosition()
    if (!restoration) return null

    return this.scrollTo(restoration.offset)
  }

  /**
   * Set a pending scroll restoration position (e.g., from navigation)
   */
  setPendingScrollRestore(offset: number, key?: string | number): void {
    this.scrollRestoration?.setPendingRestore(offset, key)
  }

  /**
   * Get scroll restoration history
   */
  getScrollHistory(): readonly ScrollHistoryEntry[] {
    return this.scrollRestoration?.getHistory() ?? []
  }

  /**
   * Clear scroll restoration history
   */
  clearScrollHistory(): void {
    this.scrollRestoration?.clearHistory()
  }

  /**
   * Update scroll restoration key for dynamic content
   */
  updateScrollRestorationKey(key: string): void {
    this.scrollRestoration?.updateRestorationKey(key)
  }

  /**
   * Check if scroll position should be restored
   */
  shouldRestoreScroll(): boolean {
    return this.scrollRestoration?.shouldRestore(this.scrollOffset) ?? false
  }

  // ============================================
  // Smooth Scrolling API
  // ============================================

  /**
   * Perform smooth scroll to specific offset
   */
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

  /**
   * Cancel any ongoing smooth scroll
   */
  cancelSmoothScroll(): void {
    this.currentSmoothScroll?.cancel()
  }

  /**
   * Check if smooth scrolling is currently active
   */
  isSmoothScrolling(): boolean {
    return this.currentSmoothScroll !== null
  }

  /**
   * Set scroll element for smooth scrolling (for subclasses to override)
   */
  setScrollElement(element: Element): void {
    // Backwards-compatible alias for init()
    if (element instanceof HTMLElement) {
      this.init(element)
    }
  }

  // ============================================
  // Velocity Tracking & Overscan API
  // ============================================

  /**
   * Get current velocity state
   */
  getVelocityState(): VelocityState | null {
    return this.velocityTracker?.getCurrentVelocityState() ?? null
  }

  /**
   * Get current overscan calculation result
   */
  getCurrentOverscan(): OverscanCalculationResult | null {
    const { overscan } = this.options

    if (!this.velocityTracker || !overscan.dynamic) return null

    const averageItemSize = this.getAverageItemSize()
    return this.velocityTracker.calculateDynamicOverscan(overscan.count, this.viewportSize, averageItemSize)
  }

  /**
   * Update overscan configuration dynamically
   */
  setOverscan(overscan: OverscanConfig | number): void {
    this.options.overscan = resolveOverscanConfig(overscan)
    // Initialize velocity tracker if dynamic overscan is now enabled
    if (this.options.overscan.dynamic && !this.velocityTracker) {
      this.velocityTracker = new VelocityTracker()
    }
    // Trigger range recalculation
    this.calculateRange()
  }

  destroy(): void {
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer)
    }

    // Cleanup scroll listener
    this.detachScrollListener()

    // Cleanup advanced features
    this.resizeObserver?.disconnect()
    this.intersectionObserver?.disconnect()
    this.velocityTracker?.reset()
    this.sizeObserver?.destroy()
    this.scrollRestoration?.destroy()

    // Cancel any ongoing smooth scroll
    this.cancelSmoothScroll()

    this.measureCache.clear()
    this.pendingSizeUpdates.clear()
    this.elementsByIndex.clear()
  }
}
