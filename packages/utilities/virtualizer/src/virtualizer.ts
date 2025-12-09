import type {
  CSSProperties,
  ItemState,
  OverscanConfig,
  PerformanceMetrics,
  Range,
  ScrollHistoryEntry,
  ScrollRestorationConfig,
  ScrollState,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  VirtualItem,
  VirtualizerOptions,
} from "./types"
import { SizeObserver } from "./utils/size-observer"
import { DOMOrderManager } from "./utils/dom-order-manager"
import { IntersectionObserverManager } from "./utils/intersection-observer-manager"
import { resolveOverscanConfig, SCROLL_END_DELAY_MS } from "./utils/overscan"
import { PerformanceMonitor } from "./utils/performance-monitor"
import { ResizeObserverManager } from "./utils/resize-observer-manager"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"
import { ScrollRestorationManager } from "./utils/scroll-restoration-manager"
import { easingFunctions, smoothScrollTo, type SmoothScrollResult } from "./utils/smooth-scroll"
import { VelocityTracker, type OverscanCalculationResult, type VelocityState } from "./utils/velocity-tracker"
import { ViewPool } from "./utils/view-pool"

const now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now()

type ResolvedBaseOptions = Required<
  Omit<
    VirtualizerOptions,
    | "onScroll"
    | "onRangeChange"
    | "onVisibilityChange"
    | "onPerfMetrics"
    | "onContainerResize"
    | "overscan"
    | "scrollRestoration"
  >
> &
  Pick<
    VirtualizerOptions,
    "onScroll" | "onRangeChange" | "onVisibilityChange" | "onPerfMetrics" | "onContainerResize"
  > & {
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

  // Scroll state
  protected scrollOffset = 0
  protected prevScrollOffset = 0
  protected scrollDirection: "forward" | "backward" = "forward"
  protected isScrolling = false
  protected scrollEndTimer: ReturnType<typeof setTimeout> | null = null

  // Viewport
  protected viewportSize = 0
  protected containerSize = 0

  // Visible range
  protected range: Range = { startIndex: 0, endIndex: -1 }
  private lastCalculatedOffset: number = -1
  private cachedVirtualItems: VirtualItem[] = []
  private virtualItemsCacheKey: string = ""

  // Performance tracking
  protected lastCalcTime = 0

  // Advanced features
  private velocityTracker?: VelocityTracker
  private resizeObserver?: ResizeObserverManager
  private intersectionObserver?: IntersectionObserverManager
  private perfMonitor?: PerformanceMonitor
  private viewPool?: ViewPool<HTMLElement>
  private sizeObserver?: SizeObserver
  private scrollRestoration?: ScrollRestorationManager
  private domOrderManager?: DOMOrderManager

  // Dynamic sizing
  private pendingSizeUpdates = new Map<number, number>()
  private sizeUpdateScheduled = false

  // Element tracking for proper cleanup
  private elementsByIndex = new Map<number, Element>()

  // Smooth scroll state
  private currentSmoothScroll: SmoothScrollResult | null = null

  // Scroll listener management
  private scrollElement: Element | Window | null = null

  constructor(options: O) {
    const overscan = resolveOverscanConfig(options.overscan)

    this.options = {
      horizontal: false,
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      initialOffset: 0,
      rootMargin: "50px",
      enableViewRecycling: false,
      preserveScrollAnchor: true,
      enablePerfMonitoring: false,
      enableAutoSizing: false,
      enableDOMOrderOptimization: false,
      domReorderDelay: 50,
      ...options,
      overscan,
    } as ResolvedBaseOptions & O

    this.scrollOffset = this.options.initialOffset
    this.initializeAdvancedFeatures()
    this.initializeMeasurements()
    // Don't attach scroll listener in constructor since DOM may not be ready
  }

  private initializeAdvancedFeatures(): void {
    // Initialize velocity tracker for dynamic overscan
    if (this.options.overscan.dynamic) {
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

    // Initialize performance monitoring
    if (this.options.enablePerfMonitoring && this.options.onPerfMetrics) {
      this.perfMonitor = new PerformanceMonitor({
        onMetrics: this.options.onPerfMetrics,
      })
    }

    // Initialize view recycling
    if (this.options.enableViewRecycling) {
      this.viewPool = new ViewPool<HTMLElement>(() => document.createElement("div"))
    }

    // Initialize auto-sizing
    if (this.options.enableAutoSizing) {
      this.sizeObserver = new SizeObserver({
        onResize: (size) => {
          const { horizontal } = this.options
          const viewportSize = horizontal ? size.width : size.height
          const containerSize = horizontal ? size.height : size.width

          this.setViewportSize(viewportSize)
          this.setContainerSize(containerSize)

          // Record resize in scroll restoration
          this.scrollRestoration?.handleResize(this.scrollOffset)

          // Notify user of container resize
          this.options.onContainerResize?.(size)
        },
      })

      // Auto-observe scrolling element if getScrollingEl is provided
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

    // Initialize DOM order optimization if enabled
    if (this.options.enableDOMOrderOptimization) {
      this.domOrderManager = new DOMOrderManager({
        reorderDelay: this.options.domReorderDelay,
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

    const startTime = this.perfMonitor?.startFrame() ?? now()

    const oldVirtualItems = this.cachedVirtualItems
    const newVirtualItems: VirtualItem[] = []

    // Index map for quick lookups of old items
    const oldItemsIndexMap = new Map<number, VirtualItem>()
    for (const item of oldVirtualItems) {
      oldItemsIndexMap.set(item.index, item)
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const measurement = this.getMeasurement(i)
      const oldItem = oldItemsIndexMap.get(i)

      if (oldItem && oldItem.start === measurement.start && oldItem.size === measurement.size) {
        // Reuse old item if it's unchanged
        newVirtualItems.push(oldItem)
      } else {
        // Create new item
        newVirtualItems.push({
          index: i,
          start: measurement.start,
          end: measurement.end,
          size: measurement.size,
          lane: this.getItemLane(i),
          measureElement: this.createMeasureElement(i),
        })
      }
    }

    // Cache the result
    this.cachedVirtualItems = newVirtualItems
    this.virtualItemsCacheKey = newCacheKey

    this.lastCalcTime = this.perfMonitor?.endFrame(startTime) ?? now() - startTime

    // Emit performance metrics if monitoring enabled
    if (this.perfMonitor && this.options.enablePerfMonitoring) {
      const metrics = this.perfMonitor.createMetrics({
        renderTime: this.lastCalcTime,
        cacheSize: this.measureCache.size,
        scrollVelocity: this.velocityTracker?.getAverageVelocity() ?? 0,
        visibleCount: newVirtualItems.length,
        totalSize: this.getTotalSize(),
      })
      this.options.onPerfMetrics?.(metrics)
    }

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
  protected onItemMeasured(_index: number, _size: number): boolean {
    // Optionally overridden by subclasses that persist measured sizes
    // Returns true if the size actually changed, false otherwise
    return false
  }
  protected onContainerSizeChange(_size: number): void {
    // Optionally overridden by subclasses that depend on container size (e.g., masonry)
  }
  protected getKnownItemSize(_index: number): number | undefined {
    // Optionally overridden by subclasses to return the currently known size for an item
    // Used to skip redundant size updates
    return undefined
  }

  /**
   * Get the estimated size for an item at the given index
   */
  protected getEstimatedSize(index: number): number {
    return this.options.estimatedSize(index)
  }

  protected invalidateMeasurements(fromIndex: number = 0) {
    this.lastCalculatedOffset = -1 // Invalidate range cache
    this.virtualItemsCacheKey = "" // Invalidate items cache
    for (const key of this.measureCache.keys()) {
      if (key >= fromIndex) {
        this.measureCache.delete(key)
      }
    }
  }

  // ============================================
  // Range Calculation
  // ============================================

  /**
   * Calculate visible range and apply overscan
   * Simple and fast: fixed overscan
   */
  protected calculateRange(): void {
    // Skip if already calculated for this scroll offset (avoid double calculation)
    if (this.lastCalculatedOffset === this.scrollOffset && this.range.endIndex >= 0) {
      return
    }

    // Try to attach scroll listener if not already attached (lazy initialization)
    this.attachScrollListener()

    const { count, overscan, horizontal, rtl } = this.options

    if (count === 0 || this.viewportSize === 0) {
      this.range = { startIndex: 0, endIndex: -1 }
      this.lastCalculatedOffset = this.scrollOffset
      return
    }

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

    let overscanStart = leadingOverscan
    let overscanEnd = trailingOverscan

    if (overscan.directional) {
      if (this.scrollDirection === "forward") {
        overscanEnd = leadingOverscan
        overscanStart = trailingOverscan
      } else if (this.scrollDirection === "backward") {
        overscanStart = leadingOverscan
        overscanEnd = trailingOverscan
      }
    }

    startIndex = Math.max(0, startIndex - overscanStart)
    endIndex = Math.min(count - 1, endIndex + overscanEnd)

    const rangeChanged = startIndex !== this.range.startIndex || endIndex !== this.range.endIndex
    this.range = { startIndex, endIndex }
    this.lastCalculatedOffset = this.scrollOffset

    if (rangeChanged) {
      this.options.onRangeChange?.(this.range)
    }
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

    this.isScrolling = true

    // Calculate range immediately - no throttling
    // This ensures items are always in sync with scroll position
    // This ensures we always have the correct items rendered
    // (TanStack Virtual also calculates synchronously on every scroll)
    this.calculateRange()

    // Clear existing timer
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer)
    }

    // Set scroll end timer
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false
      this.notifyScroll()

      // Record scroll position when scrolling stops (user interaction)
      this.scrollRestoration?.recordScrollPosition(this.scrollOffset, "user")

      // Flush any pending DOM reorders when scrolling stops
      this.domOrderManager?.onScrollStop()
    }, SCROLL_END_DELAY_MS)

    this.notifyScroll()
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

  setContainerSize(size: number): void {
    const sizeChanged = this.containerSize !== size
    this.containerSize = size

    if (sizeChanged) {
      this.lastCalculatedOffset = -1 // Invalidate range cache
      this.virtualItemsCacheKey = "" // Invalidate items cache
      this.onContainerSizeChange(size)
      this.calculateRange()
    }
  }

  /**
   * Resolve and cache the scroll element
   */
  private resolveScrollElement(): Element | Window | null {
    if (this.scrollElement) return this.scrollElement
    this.scrollElement = this.options.getScrollingEl?.() ?? null
    return this.scrollElement
  }

  /**
   * Measure the scroll container and set viewport/container sizes.
   */
  measure(): void {
    const scrollEl = this.resolveScrollElement()
    if (!scrollEl || scrollEl === window) return

    const rect = (scrollEl as Element).getBoundingClientRect()
    const { horizontal } = this.options

    this.setViewportSize(horizontal ? rect.width : rect.height)
    this.setContainerSize(horizontal ? rect.height : rect.width)
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

    // Use the container element if available, otherwise use window
    const scrollElement = this.getScrollElement() || window

    this.currentSmoothScroll = smoothScrollTo(scrollElement, target, {
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

  /**
   * Get the scroll element for smooth scrolling
   */
  private getScrollElement(): Element | null {
    // This should be overridden by implementations that have a specific scroll container
    // For now, return null to use window scrolling
    return null
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

  getRange(): Range {
    return { ...this.range }
  }

  getStats() {
    return {
      lastCalcTime: this.lastCalcTime,
      cacheSize: this.measureCache.size,
      visibleCount: this.range.endIndex - this.range.startIndex + 1,
      totalSize: this.getTotalSize(),
    }
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

    const scrollEl = this.resolveScrollElement()
    if (scrollEl && scrollEl !== window) {
      this.sizeObserver.observe(scrollEl as Element)
    }
  }

  /**
   * Attach scroll listener to scrolling element
   */
  private scrollListenerAttached = false
  private attachScrollListener(): void {
    if (this.scrollListenerAttached) return
    if (typeof window === "undefined") return

    const scrollEl = this.resolveScrollElement() ?? window
    this.scrollElement = scrollEl
    this.scrollElement.addEventListener("scroll", this.handleScroll, { passive: true })
    this.scrollListenerAttached = true
  }

  /**
   * Remove scroll listener from container element
   */
  private detachScrollListener(): void {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener("scroll", this.handleScroll)
      this.scrollElement = null
      this.scrollListenerAttached = false
    }
  }

  /**
   * Get current container size (auto-sizing only)
   */
  getContainerSize(): { width: number; height: number } | null {
    if (!this.sizeObserver) return null
    return this.sizeObserver.getCurrentSize()
  }

  /**
   * Get view recycling stats
   */
  getViewRecyclingStats() {
    return this.viewPool?.getStats() ?? null
  }

  // ============================================
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
  // DOM Order Optimization API
  // ============================================

  /**
   * Register a DOM element for order optimization
   */
  registerDOMElement(element: HTMLElement, virtualItem: VirtualItem): void {
    this.domOrderManager?.registerElement(element, virtualItem)
  }

  /**
   * Unregister a DOM element from order optimization
   */
  unregisterDOMElement(index: number): void {
    this.domOrderManager?.unregisterElement(index)
  }

  /**
   * Force immediate DOM reordering
   */
  flushDOMReorder(): void {
    this.domOrderManager?.flushReorder()
  }

  /**
   * Enable/disable DOM order optimization
   */
  setDOMOrderOptimization(enabled: boolean): void {
    this.domOrderManager?.setEnabled(enabled)
  }

  /**
   * Get DOM order optimization statistics
   */
  getDOMOrderStats(): {
    managedElements: number
    pendingReorder: boolean
    outOfOrderElements: number
  } | null {
    return this.domOrderManager?.getStats() ?? null
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
  setScrollElement(_element: Element): void {
    // Override in subclasses to set scroll container
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
   * Get detailed velocity statistics
   */
  getVelocityStats() {
    return this.velocityTracker?.getVelocityStats() ?? null
  }

  /**
   * Get current overscan calculation result
   */
  getCurrentOverscan(): OverscanCalculationResult | null {
    const { overscan } = this.options

    if (!this.velocityTracker || !overscan.dynamic) return null

    const averageItemSize = this.getAverageItemSize()
    return this.velocityTracker.calculateAdvancedOverscan(overscan.count, this.viewportSize, averageItemSize, {
      maxMultiplier: overscan.maxMultiplier,
      strategy: overscan.strategy,
      enablePredictive: overscan.predictive,
    })
  }

  /**
   * Update overscan configuration dynamically
   */
  setOverscan(overscan: OverscanConfig): void {
    this.options.overscan = resolveOverscanConfig(overscan)
    // Initialize velocity tracker if dynamic overscan is now enabled
    if (this.options.overscan.dynamic && !this.velocityTracker) {
      this.velocityTracker = new VelocityTracker()
    }
    // Trigger range recalculation
    this.calculateRange()
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics | null {
    if (!this.perfMonitor) return null

    return this.perfMonitor.createMetrics({
      renderTime: this.lastCalcTime,
      cacheSize: this.measureCache.size,
      scrollVelocity: this.velocityTracker?.getAverageVelocity() ?? 0,
      visibleCount: this.range.endIndex - this.range.startIndex + 1,
      totalSize: this.getTotalSize(),
    })
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
    this.viewPool?.clear()
    this.velocityTracker?.reset()
    this.perfMonitor?.reset()
    this.sizeObserver?.destroy()
    this.scrollRestoration?.destroy()
    this.domOrderManager?.destroy()

    // Cancel any ongoing smooth scroll
    this.cancelSmoothScroll()

    this.measureCache.clear()
    this.pendingSizeUpdates.clear()
    this.elementsByIndex.clear()
  }
}
