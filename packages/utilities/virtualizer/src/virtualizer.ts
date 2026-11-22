import { AnimationFrame, getComputedStyle, getWindow, isHTMLElement, resizeObserverBorderBox } from "@zag-js/dom-query"
import { createNormalizer, type NormalizeProps, type PropTypes } from "@zag-js/types"
import { clampValue, ensure, isDev, isFunction, isNumber, isString, runIfFn } from "@zag-js/utils"
import type {
  CSSProperties,
  InitialMeasurements,
  ItemMeasurement,
  Range,
  RangeChangeReason,
  ScrollByOptions,
  ScrollAnchor,
  ScrollState,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  ShouldAdjustScrollOnSizeChangeContext,
  TimerId,
  VirtualItem,
  VirtualizerOptions,
} from "./types"
import { isSameOption } from "./utils/options"
import { SetupWarnings } from "./utils/dev"
import { partSelector, trackElements } from "./utils/track-elements"
import { IntersectionObserverManager } from "./utils/intersection-observer-manager"
import { getScrollPosition, getScrollPositionFromEvent, setScrollPosition } from "./utils/scroll-helpers"
import { smoothScrollTo, type SmoothScrollResult } from "./utils/smooth-scroll"

const SCROLL_END_DELAY_MS = 150
const SCROLL_TO_INDEX_SETTLE_TOLERANCE = 1
const SCROLL_TO_INDEX_SETTLE_MAX_ATTEMPTS = 2
const SCALE_WARNING_EPSILON = 0.001

const getTimestamp = () => globalThis.performance?.now?.() ?? Date.now()

type RangeChangeReasonDetails = { reason: RangeChangeReason }
type SmoothScrollOptions = Exclude<NonNullable<ScrollToIndexOptions["smooth"]>, boolean>
type SmoothScrollFunction = NonNullable<SmoothScrollOptions["scrollFunction"]>
type RtlScrollBehavior = "negative" | "positive-descending" | "positive-ascending"

function easeOutCubic(t: number): number {
  const shiftedT = t - 1
  return shiftedT * shiftedT * shiftedT + 1
}

const DEFAULT_SMOOTH_SCROLL_OPTIONS: Required<Pick<SmoothScrollOptions, "duration" | "easing">> = {
  duration: 600,
  easing: easeOutCubic,
}

type CallbackOptions = "onScroll" | "onScrollEnd" | "onRangeChange" | "onVisibilityChange" | "onEndReached"

type ResolvedBaseOptions = Required<Omit<VirtualizerOptions, CallbackOptions>> &
  Pick<VirtualizerOptions, CallbackOptions>

function defaultRangeExtractor(range: Range): number[] {
  const indexes: number[] = []
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    indexes.push(i)
  }
  return indexes
}

function areEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Shared logic for all virtualizer variants (list, grid, table, masonry).
 * Layout-specific classes implement measurement and range calculation details.
 */
interface ScrollportInsets {
  padding: number
  scrollPaddingStart: number
  scrollPaddingEnd: number
}

const NO_INSETS: ScrollportInsets = { padding: 0, scrollPaddingStart: 0, scrollPaddingEnd: 0 }

export type ScrollEventLike = Event | { currentTarget: { scrollTop: number; scrollLeft: number } }

let uid = 0
const defaultNormalize = createNormalizer((props) => props)

const parsePx = (value: string | undefined) => Number.parseFloat(value ?? "") || 0

export abstract class Virtualizer<O extends VirtualizerOptions = VirtualizerOptions, T extends PropTypes = PropTypes> {
  protected options: ResolvedBaseOptions & O

  // Measurements — lazy invalidation via dirty floor instead of Map iteration
  protected measureCache: Map<number, ItemMeasurement> = new Map()
  /** Size-tracker version the measureCache entries were computed from. */
  protected measureCacheVersion = -1
  protected itemSizeCache: Map<number, number> = new Map()
  protected measureCacheDirtyFrom = Infinity

  // Scroll state
  protected scrollOffset = 0
  protected prevScrollOffset = 0
  protected scrollDirection: "forward" | "backward" = "forward"
  protected scrollVelocity = 0
  protected rangeExtractorDirection: "forward" | "backward" | null = null
  protected isScrolling = false
  private rtlScrollBehavior: RtlScrollBehavior | null = null
  private scrollEndTimer: TimerId | null = null
  private lastScrollTimestamp: number | null = null

  // Viewport
  protected viewportSize = 0
  protected crossAxisSize = 0

  // Visible range — integer cache key (no string allocation)
  protected range: Range = { startIndex: 0, endIndex: -1 }
  private lastCalculatedOffset: number = -1
  private lastCalculatedScrollMargin: number = -1
  private cachedVirtualItems: VirtualItem[] = []
  private cachedVirtualIndexes: number[] = []
  private cachedRangeStart = -1
  private cachedRangeEnd = -2
  private cachedVisibleRangeStart = -1
  private cachedVisibleRangeEnd = -2
  private virtualItemObjectCache: Map<number, VirtualItem> = new Map()
  private keyIndexCache: Map<string | number, number> = new Map()

  // Advanced features
  private resizeObserverCleanups = new Map<Element, VoidFunction>()
  private intersectionObserver?: IntersectionObserverManager
  private scrollElementResizeCleanup?: VoidFunction

  // Dynamic sizing — RAF batch for ResizeObserver-originated updates only
  private pendingSizeUpdates = new Map<number, { size: number; element: Element | undefined }>()
  private sizeUpdateFrame = AnimationFrame.create()

  // Sync measurement batch — one idle notification after all refs in a commit
  private pendingSyncNotify = false

  // Element tracking for proper cleanup
  private elementsByIndex = new Map<number, Element>()

  // Smooth scroll state
  private currentSmoothScroll: SmoothScrollResult | null = null

  // Pending convergence-pass RAF for scrollToIndex with variable heights
  private pendingConvergenceRaf: number | null = null
  private convergenceId = 0
  private isApplyingConvergenceScroll = false
  private pendingInitialOffsetRaf: number | null = null
  private hasAppliedInitialOffset = false
  private isDestroyed = false

  private setupWarnings = new SetupWarnings()
  private hasMeasuredItems = false

  /** Stamped on the elements the prop getters return */
  readonly id: string
  protected normalize: NormalizeProps<T>

  protected scrollElement: HTMLElement | null = null
  private scrollCleanup: VoidFunction | undefined
  private trackCleanup: VoidFunction | undefined
  private indexByElement = new Map<Element, number>()

  /** Incremented when external-store subscribers (e.g. React useSyncExternalStore) should re-render. */
  private storeVersion = 0
  private storeListeners = new Set<VoidFunction>()

  constructor(options: O) {
    this.options = {
      orientation: "vertical",
      dir: "ltr",
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      scrollMargin: 0,
      scrollPaddingStart: 0,
      scrollPaddingEnd: 0,
      initialOffset: 0,
      disableScrollOnInit: false,
      overscan: 3,
      rangeExtractor: defaultRangeExtractor,
      retainedIndexes: [],
      endReachedThreshold: 0,
      rootMargin: "50px",
      preserveScrollAnchor: true,
      overflowAnchor: "none",
      observeScrollElementSize: false,
      scrollEndDelay: SCROLL_END_DELAY_MS,
      ...options,
    } as ResolvedBaseOptions & O

    this.id = options.id ?? `virtualizer-${++uid}`
    this.normalize = (options.normalizeProps ?? defaultNormalize) as NormalizeProps<T>
    this.scrollOffset = this.options.initialOffset
    this.initializeAdvancedFeatures()
    this.initializeMeasurements()
  }

  protected get isHorizontal(): boolean {
    return this.options.orientation === "horizontal"
  }

  protected get isRtl(): boolean {
    return this.options.dir === "rtl"
  }

  protected get destroyed(): boolean {
    return this.isDestroyed
  }

  init(scrollElement: HTMLElement): void {
    this.isDestroyed = false
    this.scrollElement = scrollElement
    this.rtlScrollBehavior = null
    this.listenToScroll(scrollElement)
    this.trackElements(scrollElement)

    if (this.options.observeScrollElementSize) {
      this.observeScrollElementSize(scrollElement)
    }

    this.measure()
    this.applyInitialScrollOffset()

    if (isDev() && isHTMLElement(scrollElement)) {
      this.checkScrollElementSetup(scrollElement)
    }
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
    if (this.isDestroyed) return
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

  protected checkScrollElementSetup(element: HTMLElement): void {
    if (this.hasNonIdentityScale(getComputedStyle(element).transform)) {
      this.setupWarnings.warn("scaled-container")
    }

    // A short list that fits on screen is fine
    const totalSize = this.getTotalSize()
    const win = getWindow(element)
    const windowSize = this.isHorizontal ? win.innerWidth : win.innerHeight
    if (totalSize > windowSize && this.getScrollportSize() >= totalSize) {
      this.setupWarnings.warn("unconstrained-container")
    }
  }

  /** Listens to the scroll container directly, so no framework re-render can drop the listener */
  protected listenToScroll(element: HTMLElement): void {
    this.scrollCleanup?.()
    if (!isHTMLElement(element)) return
    const onScroll = (event: Event) => this.handleScrollEvent(event)
    element.addEventListener("scroll", onScroll, { passive: true })
    this.scrollCleanup = () => element.removeEventListener("scroll", onScroll)
  }

  /** Parts whose elements are found and measured automatically */
  protected getTrackedParts(): string[] {
    return ["item"]
  }

  private trackElements(root: HTMLElement): void {
    this.trackCleanup?.()
    if (!isHTMLElement(root)) return
    const selector = this.getTrackedParts()
      .map((part) => partSelector(part, this.id))
      .join(",")
    this.trackCleanup = trackElements(root, {
      selector,
      onAdd: (element) => this.onElementAdded(element),
      onRemove: (element) => this.onElementRemoved(element),
      onIndexChange: (element) => {
        this.onElementRemoved(element)
        this.onElementAdded(element)
      },
    })
  }

  protected onElementAdded(element: HTMLElement): void {
    if (!element.hasAttribute("data-virtualizer-item")) return
    const index = Number(element.dataset.index)
    if (Number.isInteger(index)) this.attachItemElement(index, element)
  }

  protected onElementRemoved(element: HTMLElement): void {
    const index = this.indexByElement.get(element)
    if (index !== undefined) this.detachItemElement(index, element)
  }

  private checkItemsMeasured(): void {
    if (this.hasMeasuredItems || !this.shouldMeasureItems()) return
    if (this.options.initialMeasurements) return
    if (this.options.count === 0) return
    this.setupWarnings.warn("unmeasured-items")
  }

  private hasNonIdentityScale(transform: string | null): boolean {
    if (!transform || transform === "none") return false

    const scaleMatch = transform.match(/scale(?:3d)?\(([^)]+)\)/i)
    if (scaleMatch) {
      const values = scaleMatch[1]
        ?.split(",")
        .map((part) => Number(part.trim()))
        .filter((value) => Number.isFinite(value))
      if (values && values.length > 0) {
        return values.some((value) => Math.abs(value - 1) > SCALE_WARNING_EPSILON)
      }
    }

    const matrixMatch = transform.match(/matrix\(([^)]+)\)/i)
    if (matrixMatch) {
      const values = matrixMatch[1]
        ?.split(",")
        .map((part) => Number(part.trim()))
        .filter((value) => Number.isFinite(value))
      if (values.length >= 4) {
        return Math.abs(values[0]! - 1) > SCALE_WARNING_EPSILON || Math.abs(values[3]! - 1) > SCALE_WARNING_EPSILON
      }
    }

    const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/i)
    if (matrix3dMatch) {
      const values = matrix3dMatch[1]
        ?.split(",")
        .map((part) => Number(part.trim()))
        .filter((value) => Number.isFinite(value))
      if (values.length >= 6) {
        return Math.abs(values[0]! - 1) > SCALE_WARNING_EPSILON || Math.abs(values[5]! - 1) > SCALE_WARNING_EPSILON
      }
    }

    return false
  }

  private observeScrollElementSize(element: HTMLElement): void {
    this.scrollElementResizeCleanup?.()

    const horizontal = this.isHorizontal
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

  /** Props for the scroll container. Attach the container with `init(element)`. */
  getRootProps(): T["element"] {
    return this.normalize.element({
      "data-virtualizer-root": this.id,
      "data-empty": this.options.count === 0 ? "" : undefined,
      // Focusable so keyboard users can scroll it; a component's own tabIndex, merged after, wins
      tabIndex: this.getRootTabIndex(),
      ...this.getRootAria(),
      // `--total-size` lets the container size itself, e.g. `max-height: min(400px, var(--total-size))`
      style: { ...this.getRootStyle(), "--total-size": `${this.getTotalSize()}px` },
    })
  }

  /** Props for the element sized to every item, which holds the rendered items */
  getContentProps(): T["element"] {
    return this.normalize.element({
      "data-virtualizer-content": this.id,
      style: this.getContentStyle(),
    })
  }

  /** Props for a rendered item. Positions it and, unless sizes are fixed, measures it. */
  getItemProps(virtualItem: VirtualItem): T["element"] {
    return this.normalize.element({
      "data-virtualizer-item": this.id,
      "data-index": virtualItem.index,
      ...this.getItemAria(virtualItem.index),
      style: this.getItemStyle(virtualItem),
    })
  }

  protected getRootAria(): Record<string, string | number> {
    return {}
  }

  protected getRootTabIndex(): number | undefined {
    return 0
  }

  protected getItemAria(_index: number): Record<string, string | number> {
    return {}
  }

  protected getRootStyle(): CSSProperties {
    return {
      position: "relative",
      overflow: "auto",
      overflowAnchor: this.options.overflowAnchor,
    }
  }

  protected getContentStyle(): CSSProperties {
    const totalSize = this.getTotalSize()
    const horizontal = this.isHorizontal

    return {
      position: "relative",
      flexShrink: 0,
      width: horizontal ? `${totalSize}px` : "100%",
      height: horizontal ? "100%" : `${totalSize}px`,
      pointerEvents: this.isScrolling ? "none" : "auto",
    }
  }

  protected abstract getItemStyle(virtualItem: VirtualItem): CSSProperties

  // ============================================
  // Virtual Items
  // ============================================

  getVirtualItems(): VirtualItem[] {
    this.calculateRange()

    const { startIndex, endIndex } = this.range
    const indexes = this.getVirtualIndexes(this.range)
    const visibleRange = this.getVisibleRange()

    // Integer comparison — no string allocation
    if (
      startIndex === this.cachedRangeStart &&
      endIndex === this.cachedRangeEnd &&
      visibleRange.startIndex === this.cachedVisibleRangeStart &&
      visibleRange.endIndex === this.cachedVisibleRangeEnd &&
      areEqual(indexes, this.cachedVirtualIndexes)
    ) {
      return this.cachedVirtualItems
    }

    const newVirtualItems: VirtualItem[] = []
    const hasCustomKeys = isFunction(this.options.indexToKey)
    const seenKeys = hasCustomKeys && isDev() ? new Set<string | number>() : null

    // Lazy cleanup — only when cache grows too large
    const visibleCount = indexes.length
    if (this.virtualItemObjectCache.size > visibleCount + 200) {
      const visibleIndexes = new Set(indexes)
      for (const [index] of this.virtualItemObjectCache) {
        if (!visibleIndexes.has(index) && (index < startIndex - 100 || index > endIndex + 100)) {
          this.virtualItemObjectCache.delete(index)
        }
      }
    }

    for (const i of indexes) {
      const measurement = this.getMeasurement(i)
      const lane = this.getItemLane(i)
      const key = this.getItemKey(i)
      const isVisible = i >= visibleRange.startIndex && i <= visibleRange.endIndex
      const isOverscan = isVisible ? false : i < visibleRange.startIndex ? "before" : "after"
      const isRetained = i < startIndex || i > endIndex

      this.keyIndexCache.set(key, i)

      if (seenKeys) {
        if (seenKeys.has(key)) this.setupWarnings.warn("duplicate-key")
        seenKeys.add(key)
      }

      let cachedItem = this.virtualItemObjectCache.get(i)

      if (
        cachedItem &&
        cachedItem.key === key &&
        cachedItem.start === measurement.start &&
        cachedItem.size === measurement.size &&
        cachedItem.lane === lane &&
        cachedItem.isVisible === isVisible &&
        cachedItem.isOverscan === isOverscan &&
        cachedItem.isRetained === isRetained
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
          isVisible,
          isOverscan,
          isRetained,
        }

        if (cachedItem) {
          virtualItem.key = key
          virtualItem.start = measurement.start
          virtualItem.end = measurement.end
          virtualItem.size = measurement.size
          virtualItem.lane = lane
          virtualItem.isVisible = isVisible
          virtualItem.isOverscan = isOverscan
          virtualItem.isRetained = isRetained
        }

        this.virtualItemObjectCache.set(i, virtualItem)
        newVirtualItems.push(virtualItem)
      }
    }

    this.cachedVirtualItems = newVirtualItems
    this.cachedVirtualIndexes = indexes
    this.cachedRangeStart = startIndex
    this.cachedRangeEnd = endIndex
    this.cachedVisibleRangeStart = visibleRange.startIndex
    this.cachedVisibleRangeEnd = visibleRange.endIndex

    return newVirtualItems
  }

  private getVirtualIndexes(range: Range): number[] {
    const indexes = this.options.rangeExtractor(range, {
      velocity: this.scrollVelocity,
      direction: this.rangeExtractorDirection,
    })
    const uniqueIndexes = new Set<number>()

    for (const index of indexes) {
      if (!Number.isInteger(index)) continue
      if (index < 0 || index >= this.options.count) continue
      uniqueIndexes.add(index)
    }

    for (const index of this.options.retainedIndexes) {
      if (!Number.isInteger(index)) continue
      if (index < 0 || index >= this.options.count) continue
      uniqueIndexes.add(index)
    }

    return Array.from(uniqueIndexes).sort((a, b) => a - b)
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

  protected onMeasurementsChanged(): void {}

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

  protected readMeasuredSizeFromElement(element: HTMLElement, index: number): number {
    const measured = this.options.measureElement?.(element, {
      index,
      orientation: this.isHorizontal ? "horizontal" : "vertical",
    })
    if (isNumber(measured) && Number.isFinite(measured) && measured > 0) {
      return measured
    }
    return this.isHorizontal ? element.offsetWidth : element.offsetHeight
  }

  protected getEstimatedSize(index: number, laneWidth?: number): number {
    const { estimatedItemSize } = this.options
    return isNumber(estimatedItemSize) ? estimatedItemSize : estimatedItemSize(index, laneWidth)
  }

  protected getScrollMargin(): number {
    const { scrollMargin } = this.options
    return runIfFn(scrollMargin)
  }

  /**
   * Lazy invalidation — O(1) instead of O(k) Map iteration.
   * Sets a "dirty floor" index. getMeasurement checks this and recomputes on demand.
   */
  protected invalidateMeasurements(fromIndex: number = 0): void {
    this.lastCalculatedOffset = -1
    this.cachedRangeStart = -1
    this.cachedRangeEnd = -2
    this.cachedVisibleRangeStart = -1
    this.cachedVisibleRangeEnd = -2
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

  protected invalidateItemKeys(): void {
    this.keyIndexCache.clear()
  }

  protected applyInitialMeasurements(): void {
    if (!this.shouldMeasureItems()) return
    const seeds = this.options.initialMeasurements
    if (!seeds) return

    const keyedLookup = this.createInitialMeasurementLookup(seeds)
    let minMeasuredIndex = Infinity

    for (const [rawKey, rawSize] of this.getInitialMeasurementEntries(seeds)) {
      const size = Number(rawSize)
      if (!Number.isFinite(size) || size <= 0) continue

      const index = this.resolveInitialMeasurementIndex(rawKey, keyedLookup)
      if (index === undefined) continue

      if (this.onItemMeasured(index, size) && index < minMeasuredIndex) {
        minMeasuredIndex = index
      }
    }

    if (minMeasuredIndex !== Infinity) {
      this.invalidateMeasurements(minMeasuredIndex)
    }
  }

  private getInitialMeasurementEntries(
    seeds: InitialMeasurements,
  ): IterableIterator<[string | number, number]> | Array<[string | number, number]> {
    if (seeds instanceof Map) return seeds.entries()
    return Object.entries(seeds)
  }

  private createInitialMeasurementLookup(seeds: InitialMeasurements): Map<string | number, number> | null {
    if (isFunction(this.options.keyToIndex)) return null
    if (!this.options.indexToKey) return null
    if (seeds instanceof Map && seeds.size === 0) return null
    if (!(seeds instanceof Map) && Object.keys(seeds).length === 0) return null

    const lookup = new Map<string | number, number>()
    for (let index = 0; index < this.options.count; index++) {
      lookup.set(this.getItemKey(index), index)
    }
    return lookup
  }

  private resolveInitialMeasurementIndex(
    key: string | number,
    keyedLookup: Map<string | number, number> | null,
  ): number | undefined {
    if (keyedLookup?.has(key)) {
      return keyedLookup.get(key)
    }

    const byUser = this.options.keyToIndex?.(key)
    if (byUser !== undefined && byUser >= 0 && byUser < this.options.count) {
      return byUser
    }

    if (isNumber(key) && Number.isInteger(key) && key >= 0 && key < this.options.count) {
      return key
    }

    if (isString(key) && /^\d+$/.test(key)) {
      const index = Number(key)
      if (index >= 0 && index < this.options.count) {
        return index
      }
    }

    return undefined
  }

  // ============================================
  // Range Calculation
  // ============================================

  protected calculateRange({ reason }: RangeChangeReasonDetails = { reason: "manual" }): void {
    if (this.isDestroyed) return
    const scrollMargin = this.getScrollMargin()

    if (
      this.lastCalculatedOffset === this.scrollOffset &&
      this.lastCalculatedScrollMargin === scrollMargin &&
      this.range.endIndex >= 0
    ) {
      return
    }

    const { count, overscan } = this.options

    if (count === 0 || this.viewportSize === 0) {
      this.range = { startIndex: 0, endIndex: -1 }
      this.lastCalculatedOffset = this.scrollOffset
      this.lastCalculatedScrollMargin = scrollMargin
      return
    }

    const viewportStart = this.scrollOffset + scrollMargin
    const viewportEnd = viewportStart + this.viewportSize
    let { startIndex, endIndex } = this.findVisibleRange(viewportStart, viewportEnd)

    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(count - 1, endIndex + overscan)

    const newRange = { startIndex, endIndex }

    if (this.range.startIndex !== newRange.startIndex || this.range.endIndex !== newRange.endIndex) {
      this.range = newRange
      // Only notify after init() — before that, no scroll element is bound
      // and consumers haven't wired up rendering yet.
      if (this.scrollElement) {
        this.options.onRangeChange?.({ range: this.range, reason })
      }
    }

    this.lastCalculatedOffset = this.scrollOffset
    this.lastCalculatedScrollMargin = scrollMargin
    this.checkEndReached()
  }

  private endReachedArmed = true

  private checkEndReached(): void {
    const { count, endReachedThreshold, onEndReached } = this.options
    if (!onEndReached || !this.scrollElement) return
    const atEnd = count > 0 && this.range.endIndex >= count - 1 - endReachedThreshold
    if (!atEnd) {
      this.endReachedArmed = true
      return
    }
    if (!this.endReachedArmed) return
    this.endReachedArmed = false
    onEndReached()
  }

  // ============================================
  // Scroll Handling
  // ============================================

  protected handleScrollEvent(event: ScrollEventLike): void {
    if (this.isDestroyed) return
    const horizontal = this.isHorizontal
    const { scrollTop, scrollLeft } = getScrollPositionFromEvent(event)
    const eventTarget =
      "currentTarget" in event && event.currentTarget && isHTMLElement(event.currentTarget) ? event.currentTarget : null
    const offset = horizontal ? this.toLogicalHorizontalOffset(scrollLeft, eventTarget) : scrollTop

    if (offset === this.scrollOffset) return

    this.cancelPendingConvergence()

    this.updateScrollMotion(offset)

    this.isScrolling = true

    // Process synchronously; React consumers subscribe via useSyncExternalStore.
    this.calculateRange({ reason: "scroll" })
    this.notifyScroll()

    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer)
    this.scrollEndTimer = setTimeout(() => {
      if (this.isDestroyed) return
      this.scrollEndTimer = null
      this.isScrolling = false
      this.resetScrollMotionContext()
      this.notifyScroll()
      if (isDev()) this.checkItemsMeasured()
      this.options.onScrollEnd?.(this.getCurrentScrollState())
      // Attach ResizeObservers for items mounted during scroll.
      // During fast scroll, observer setup is skipped to avoid overhead.
      // Now that scrolling stopped, observe all currently tracked elements
      // so future size changes (image load, accordion, etc.) are detected.
      this.observeUnobservedElements()
      this.onMeasurementsChanged()
      this.notifyStore()
    }, this.options.scrollEndDelay)

    this.notifyStore()
  }

  private updateScrollMotion(nextOffset: number): void {
    const now = getTimestamp()
    const previousOffset = this.scrollOffset
    const delta = nextOffset - previousOffset
    const hasPreviousTimestamp = this.lastScrollTimestamp != null
    const elapsed = hasPreviousTimestamp ? Math.max(1, now - this.lastScrollTimestamp!) : 0

    this.prevScrollOffset = previousOffset
    this.scrollOffset = nextOffset
    this.lastScrollTimestamp = now
    this.scrollVelocity = elapsed === 0 ? 0 : Math.abs(delta) / elapsed

    if (delta === 0) return

    const rawDirection = delta > 0 ? "forward" : "backward"
    const direction =
      this.isHorizontal && this.isRtl ? (rawDirection === "forward" ? "backward" : "forward") : rawDirection

    this.scrollDirection = direction
    this.rangeExtractorDirection = hasPreviousTimestamp ? direction : null
  }

  private resetScrollMotionContext(): void {
    this.lastScrollTimestamp = null
    this.scrollVelocity = 0
    this.rangeExtractorDirection = null
  }

  private getCurrentScrollState(): ScrollState {
    const horizontal = this.isHorizontal
    const offset: ScrollState["offset"] = horizontal ? { x: this.scrollOffset, y: 0 } : { x: 0, y: this.scrollOffset }
    const direction: ScrollState["direction"] = horizontal
      ? { x: this.scrollDirection, y: "idle" }
      : { x: "idle", y: this.scrollDirection }

    return {
      offset,
      direction,
      isScrolling: this.isScrolling,
    }
  }

  private notifyScroll(): void {
    if (this.isDestroyed) return
    this.options.onScroll?.(this.getCurrentScrollState())
  }

  // ============================================
  // Public API
  // ============================================

  /** Regular method (not a class field) so subclasses can override with `super`. */
  protected setViewportSize(size: number): void {
    if (this.isDestroyed) return
    this.viewportSize = size
    this.lastCalculatedOffset = -1
    this.cachedRangeStart = -1
    this.cachedRangeEnd = -2
    this.cachedVisibleRangeStart = -1
    this.cachedVisibleRangeEnd = -2
    this.calculateRange({ reason: "resize" })
    this.notifyStore()
  }

  protected setCrossAxisSize(size: number): void {
    if (this.isDestroyed) return
    const sizeChanged = this.crossAxisSize !== size
    this.crossAxisSize = size

    if (sizeChanged) {
      this.lastCalculatedOffset = -1
      this.cachedRangeStart = -1
      this.cachedRangeEnd = -2
      this.cachedVisibleRangeStart = -1
      this.cachedVisibleRangeEnd = -2
      this.onCrossAxisSizeChange(size)
      this.calculateRange({ reason: "resize" })
      this.notifyStore()
    }
  }

  /** Geometry of any item, mounted or not. */
  getItemMetrics(index: number): ItemMeasurement | null {
    if (!Number.isInteger(index) || index < 0 || index >= this.options.count) return null
    const { start, size, end } = this.getMeasurement(index)
    return { start, size, end }
  }

  /** Index of the item at a scroll offset. */
  getIndexAtOffset(offset: number): number | null {
    if (this.options.count === 0) return null
    const index = this.findIndexAtOffset(offset + this.getScrollMargin())
    return clampValue(index, 0, this.options.count - 1)
  }

  /** Discard measured sizes, keeping the scroll position. */
  remeasure(): void {
    if (this.isDestroyed) return
    const anchor = this.options.preserveScrollAnchor ? this.getScrollAnchor() : null
    this.itemSizeCache.clear()
    this.onItemsChanged()
    this.forceUpdate({ reason: "measurement" })
    if (anchor) this.restoreScrollAnchor(anchor)
  }

  measure(): void {
    if (this.isDestroyed) return
    if (!this.scrollElement) return

    const rect = this.scrollElement.getBoundingClientRect()
    const horizontal = this.isHorizontal

    this.setViewportSize(horizontal ? rect.width : rect.height)
    this.setCrossAxisSize(horizontal ? rect.height : rect.width)

    if (this.remeasureTrackedElements()) {
      this.calculateRange({ reason: "measurement" })
      this.notifyStore()
    }
  }

  /**
   * When `false`, `scrollToOffset` only updates internal scroll state — the subclass scrolls the real container
   * (e.g. `window` or an overflow parent). Default `true` applies offset to `scrollElement`.
   */
  protected shouldApplyScrollToScrollElement(): boolean {
    return true
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  scrollToOffset(offset: number, options: ScrollByOptions = {}): ScrollToIndexResult {
    if (this.isDestroyed) {
      return this.isHorizontal ? { scrollLeft: this.scrollOffset } : { scrollTop: this.scrollOffset }
    }
    if (!this.isApplyingConvergenceScroll) {
      this.cancelPendingConvergence()
    }

    const targetOffset = Math.max(0, offset)

    if (options.smooth) {
      return this.performSmoothScroll(targetOffset, options.smooth)
    }

    const horizontal = this.isHorizontal
    const existing = this.scrollElement ? getScrollPosition(this.scrollElement) : { scrollTop: 0, scrollLeft: 0 }

    if (this.scrollElement && this.shouldApplyScrollToScrollElement()) {
      setScrollPosition(
        this.scrollElement,
        horizontal
          ? {
              scrollLeft: this.toRawHorizontalOffset(targetOffset, this.scrollElement),
            }
          : { scrollTop: targetOffset },
      )
    }

    this.updateScrollMotion(targetOffset)

    this.calculateRange({ reason: "manual" })
    this.notifyScroll()
    this.notifyStore()

    if (horizontal) return { scrollLeft: targetOffset, scrollTop: existing.scrollTop }
    return { scrollTop: targetOffset, scrollLeft: existing.scrollLeft }
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  scrollBy(delta: number, options: ScrollByOptions = {}): ScrollToIndexResult {
    return this.scrollToOffset(this.scrollOffset + delta, options)
  }

  private applyInitialScrollOffset(): void {
    if (this.hasAppliedInitialOffset || this.options.disableScrollOnInit) return

    this.hasAppliedInitialOffset = true

    const targetOffset = this.options.initialOffset
    if (targetOffset <= 0) return

    this.scrollToOffset(targetOffset)
    this.retryInitialScrollOffsetIfClamped(targetOffset)
  }

  private retryInitialScrollOffsetIfClamped(targetOffset: number): void {
    if (!this.scrollElement) return
    if (typeof requestAnimationFrame === "undefined") return

    const horizontal = this.isHorizontal
    const appliedOffset = horizontal
      ? this.toLogicalHorizontalOffset(this.scrollElement.scrollLeft, this.scrollElement)
      : this.scrollElement.scrollTop
    if (Math.abs(appliedOffset - targetOffset) < SCROLL_TO_INDEX_SETTLE_TOLERANCE) return

    this.pendingInitialOffsetRaf = requestAnimationFrame(() => {
      this.pendingInitialOffsetRaf = null
      if (this.isDestroyed || this.options.disableScrollOnInit) return
      this.scrollToOffset(targetOffset)
    })
  }

  /**
   * Compute the list-space scroll offset for a given index + alignment.
   * Returns `null` when `align: "auto"` and the item is already visible.
   */
  /** Visible size along the scroll axis, excluding scrollbars and borders. */
  protected getScrollportSize(): number {
    const element = this.scrollElement
    return (this.isHorizontal ? element?.clientWidth : element?.clientHeight) || this.viewportSize
  }

  /** The scroll container's CSS padding and `scroll-padding` along the scroll axis, like `scrollIntoView` uses. */
  protected getScrollportInsets(): ScrollportInsets {
    const element = this.scrollElement
    if (!isHTMLElement(element)) return NO_INSETS
    const style = getComputedStyle(element)
    const axis = this.isHorizontal ? "Inline" : "Block"
    return {
      padding: parsePx(style[`padding${axis}Start`]),
      scrollPaddingStart: parsePx(style[`scrollPadding${axis}Start`]),
      scrollPaddingEnd: parsePx(style[`scrollPadding${axis}End`]),
    }
  }

  protected resolveScrollToOffset(index: number, align: ScrollToIndexOptions["align"] = "auto"): number | null {
    const { count } = this.options
    if (index < 0 || index >= count) return this.scrollOffset

    const insets = this.getScrollportInsets()
    const scrollPaddingStart = this.options.scrollPaddingStart + insets.scrollPaddingStart
    const scrollPaddingEnd = this.options.scrollPaddingEnd + insets.scrollPaddingEnd
    const scrollMargin = this.getScrollMargin() - insets.padding
    const viewportSize = this.getScrollportSize()
    const measurement = this.getMeasurement(index)

    if (align === "auto") {
      const itemStart = measurement.start
      const itemEnd = measurement.end
      const viewportStart = this.scrollOffset + scrollMargin + scrollPaddingStart
      const viewportEnd = this.scrollOffset + scrollMargin + viewportSize - scrollPaddingEnd

      if (itemStart < viewportStart) return itemStart - scrollMargin - scrollPaddingStart
      if (itemEnd > viewportEnd) return itemEnd - scrollMargin - viewportSize + scrollPaddingEnd
      return null
    }

    const effectiveViewportSize = Math.max(0, viewportSize - scrollPaddingStart - scrollPaddingEnd)
    let offset = measurement.start - scrollMargin - scrollPaddingStart
    switch (align) {
      case "center":
        offset -= (effectiveViewportSize - measurement.size) / 2
        break
      case "end":
        offset = measurement.end - scrollMargin - viewportSize + scrollPaddingEnd
        break
    }
    return Math.max(0, offset)
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  scrollToIndex(index: number, options: ScrollToIndexOptions = {}): ScrollToIndexResult {
    if (this.isDestroyed) {
      return this.isHorizontal ? { scrollLeft: this.scrollOffset } : { scrollTop: this.scrollOffset }
    }
    const { align = "auto", smooth, settle } = options

    this.cancelPendingConvergence()

    const targetOffset = this.resolveScrollToOffset(index, align)
    if (targetOffset === null) {
      return this.isHorizontal ? { scrollLeft: this.scrollOffset } : { scrollTop: this.scrollOffset }
    }

    const result = this.scrollToOffset(targetOffset, { smooth })

    // Convergence pass: if the target wasn't measured before this call,
    // resolveScrollToOffset used estimateSize. After the scroll causes the
    // item to mount and measure, the real offset may differ — correct on
    // the next frame. Skip for smooth scrolls (would cause visible jump).
    if (settle !== false && !smooth && this.shouldMeasureItems()) {
      this.scheduleConvergence(index, align, 0)
    }

    return result
  }

  private scheduleConvergence(
    index: number,
    align: NonNullable<ScrollToIndexOptions["align"]>,
    attempt: number,
    convergenceId = ++this.convergenceId,
  ): void {
    if (this.isDestroyed) return
    if (attempt >= SCROLL_TO_INDEX_SETTLE_MAX_ATTEMPTS) return
    if (typeof requestAnimationFrame === "undefined") return
    if (this.pendingConvergenceRaf != null) cancelAnimationFrame(this.pendingConvergenceRaf)

    this.pendingConvergenceRaf = requestAnimationFrame(() => {
      if (this.isDestroyed || this.convergenceId !== convergenceId) return
      this.pendingConvergenceRaf = null

      const correctedOffset = this.resolveScrollToOffset(index, align)
      if (correctedOffset === null) return

      const drift = Math.abs(correctedOffset - this.scrollOffset)
      if (drift < SCROLL_TO_INDEX_SETTLE_TOLERANCE) return

      this.isApplyingConvergenceScroll = true
      try {
        this.scrollToOffset(correctedOffset)
      } finally {
        this.isApplyingConvergenceScroll = false
      }
      this.scheduleConvergence(index, align, attempt + 1, convergenceId)
    })
  }

  private cancelPendingConvergence(): void {
    this.convergenceId++
    if (this.pendingConvergenceRaf != null) {
      cancelAnimationFrame(this.pendingConvergenceRaf)
      this.pendingConvergenceRaf = null
    }
  }

  private performSmoothScroll(
    targetOffset: number,
    smoothOptions: boolean | NonNullable<ScrollToIndexOptions["smooth"]>,
  ): ScrollToIndexResult {
    const horizontal = this.isHorizontal

    this.currentSmoothScroll?.cancel()

    const options =
      typeof smoothOptions === "object"
        ? { ...DEFAULT_SMOOTH_SCROLL_OPTIONS, ...smoothOptions }
        : DEFAULT_SMOOTH_SCROLL_OPTIONS

    const easingFn = isFunction(options.easing) ? options.easing : easeOutCubic

    const userScrollFn =
      typeof smoothOptions === "object" && "scrollFunction" in smoothOptions
        ? (smoothOptions.scrollFunction as SmoothScrollFunction | undefined)
        : undefined

    const customScrollFunction: SmoothScrollFunction =
      userScrollFn ||
      ((position: { scrollTop?: number; scrollLeft?: number }) => {
        if (this.isDestroyed) return
        const newOffset = horizontal
          ? this.toLogicalHorizontalOffset(
              position.scrollLeft ?? this.toRawHorizontalOffset(this.scrollOffset, this.scrollElement),
              this.scrollElement,
            )
          : (position.scrollTop ?? this.scrollOffset)

        if (this.scrollElement) {
          setScrollPosition(this.scrollElement, {
            scrollTop: position.scrollTop,
            scrollLeft: position.scrollLeft,
          })
        }

        this.updateScrollMotion(newOffset)

        this.isScrolling = true

        this.calculateRange({ reason: "manual" })
        this.notifyScroll()
        this.notifyStore()
      })

    const target = horizontal
      ? { x: this.toRawHorizontalOffset(targetOffset, this.scrollElement) }
      : { y: targetOffset }

    ensure(
      this.scrollElement,
      () =>
        "[@zag-js/virtualizer] Missing scroll element. Call `virtualizer.init(element)` before using smooth scrolling.",
    )

    this.currentSmoothScroll = smoothScrollTo(this.scrollElement, target, {
      duration: options.duration,
      easing: easingFn,
      scrollFunction: customScrollFunction,
      onComplete: () => {
        if (this.isDestroyed) return
        this.currentSmoothScroll = null
        this.isScrolling = false
        this.resetScrollMotionContext()
        this.notifyScroll()
        this.options.onScrollEnd?.(this.getCurrentScrollState())
        this.notifyStore()
      },
      onCancel: () => {
        if (this.isDestroyed) return
        this.currentSmoothScroll = null
        this.isScrolling = false
        this.resetScrollMotionContext()
        this.notifyStore()
      },
    })

    return horizontal ? { scrollLeft: targetOffset } : { scrollTop: targetOffset }
  }

  measureItem(index: number, size: number): void {
    if (this.isDestroyed || !this.shouldMeasureItems()) return
    this.hasMeasuredItems = true
    const previousSize = this.getKnownItemSize(index) ?? this.getEstimatedSize(index)
    const delta = size - previousSize
    const shouldAdjust = this.shouldAdjustScrollOnSizeChange(index, delta)
    let changed = false
    const applyMeasurement = () => {
      changed = this.onItemMeasured(index, size)
      if (changed) {
        this.invalidateMeasurements(index)
      }
    }

    if (shouldAdjust) {
      this.preserveScrollPosition(index, applyMeasurement)
    } else {
      applyMeasurement()
    }

    if (!changed) return

    this.calculateRange({ reason: "measurement" })
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
    const previousSize = this.getKnownItemSize(index) ?? this.getEstimatedSize(index)
    const delta = size - previousSize
    const shouldAdjust = this.shouldAdjustScrollOnSizeChange(index, delta)
    let changed = false
    const applyMeasurement = () => {
      changed = this.onItemMeasured(index, size)
      if (changed) {
        this.invalidateMeasurements(index)
      }
    }

    if (shouldAdjust) {
      this.preserveScrollPosition(index, applyMeasurement)
    } else {
      applyMeasurement()
    }

    if (!changed) return

    // Notify once per batch, also while scrolling: items mounted during a fast scroll
    // would otherwise paint at their estimated positions until scrolling stops.
    if (!this.pendingSyncNotify) {
      this.pendingSyncNotify = true
      queueMicrotask(() => {
        this.pendingSyncNotify = false
        if (this.isDestroyed) return
        const prevRange = { ...this.range }
        this.calculateRange({ reason: "measurement" })
        const rangeNotified =
          prevRange.startIndex !== this.range.startIndex || prevRange.endIndex !== this.range.endIndex
        if (!rangeNotified) {
          this.options.onRangeChange?.({
            range: this.range,
            reason: "measurement",
          })
        }
        this.notifyStore()
      })
    }
  }

  /**
   * Schedule a size update via RAF batching.
   * Used for ResizeObserver callbacks (fire async, outside React commit phase).
   */
  protected scheduleSizeUpdate(index: number, size: number, element?: Element): void {
    if (this.isDestroyed) return

    this.pendingSizeUpdates.set(index, { size, element })

    if (!this.sizeUpdateFrame.isActive()) {
      this.sizeUpdateFrame.request(() => {
        this.flushSizeUpdates()
      })
    }
  }

  private flushSizeUpdates(): void {
    if (this.isDestroyed || !this.shouldMeasureItems()) {
      this.pendingSizeUpdates.clear()
      return
    }

    if (this.pendingSizeUpdates.size === 0) return

    const updates: Array<{
      index: number
      size: number
      shouldAdjust: boolean
    }> = []
    for (const [index, { size, element }] of this.pendingSizeUpdates) {
      if (element && this.elementsByIndex.get(index) !== element) continue
      const previousSize = this.getKnownItemSize(index) ?? this.getEstimatedSize(index)
      const delta = size - previousSize
      updates.push({
        index,
        size,
        shouldAdjust: this.shouldAdjustScrollOnSizeChange(index, delta),
      })
    }

    this.pendingSizeUpdates.clear()

    const prevRange = { ...this.range }
    let anySizeChanged = false
    let minIndex = Infinity
    const applyMeasurements = () => {
      for (const update of updates) {
        if (this.onItemMeasured(update.index, update.size)) {
          anySizeChanged = true
          if (update.index < minIndex) minIndex = update.index
        }
      }

      if (!anySizeChanged) return

      this.invalidateMeasurements(minIndex)
      this.onMeasurementsChanged()
    }

    const adjustCandidate = updates.reduce((min, update) => {
      if (!update.shouldAdjust) return min
      return update.index < min ? update.index : min
    }, Infinity)

    if (adjustCandidate !== Infinity) {
      this.preserveScrollPosition(adjustCandidate, applyMeasurements)
    } else {
      applyMeasurements()
    }

    if (!anySizeChanged) return

    this.calculateRange({ reason: "measurement" })

    // Notify even when range indices didn't change — sizes changed, items need repositioning
    const rangeNotified = prevRange.startIndex !== this.range.startIndex || prevRange.endIndex !== this.range.endIndex
    if (!rangeNotified) {
      this.options.onRangeChange?.({
        range: this.range,
        reason: "measurement",
      })
    }

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

    const anchor = this.getScrollAnchor()
    if (!anchor) {
      callback()
      return
    }

    const anchorIndex = this.getIndexForKey(anchor.key)
    if (anchorIndex === undefined) {
      callback()
      return
    }

    // Items below the anchor don't affect anchor offset
    if (fromIndex > anchorIndex) {
      callback()
      return
    }

    const anchorMeasurement = this.getMeasurement(anchorIndex)
    const anchorOffset = anchorMeasurement.start

    callback()

    const nextAnchorIndex = this.getIndexForKey(anchor.key)
    if (nextAnchorIndex === undefined) return
    const newAnchorMeasurement = this.getMeasurement(nextAnchorIndex)
    const deltaOffset = newAnchorMeasurement.start - anchorOffset

    if (deltaOffset !== 0) {
      this.scrollOffset += deltaOffset
      // Also update the DOM scroll position to stay in sync
      if (this.scrollElement) {
        if (this.isHorizontal) {
          this.scrollElement.scrollLeft = this.toRawHorizontalOffset(this.scrollOffset, this.scrollElement)
        } else {
          this.scrollElement.scrollTop += deltaOffset
        }
      }
    }
  }

  private shouldAdjustScrollOnSizeChange(index: number, delta: number): boolean {
    if (!this.options.preserveScrollAnchor || this.range.startIndex < 0) return false
    if (delta === 0) return false
    if (!this.options.shouldAdjustScrollOnSizeChange) {
      return index <= this.range.startIndex
    }

    const measurement = this.getMeasurement(index)
    const viewportStart = this.scrollOffset + this.getScrollMargin()
    const context: ShouldAdjustScrollOnSizeChangeContext = {
      index,
      key: this.getItemKey(index),
      delta,
      itemStart: measurement.start,
      itemEnd: measurement.end,
      viewportStart,
      currentOffset: this.scrollOffset,
      anchor: this.getScrollAnchor(),
    }

    const override = this.options.shouldAdjustScrollOnSizeChange?.(context)
    if (override !== undefined) return override

    return measurement.start < viewportStart
  }

  protected toLogicalHorizontalOffset(rawOffset: number, target: HTMLElement | null): number {
    if (!this.isHorizontal || !this.isRtl) return rawOffset
    const mode = this.resolveRtlScrollBehavior(target)
    const maxOffset = this.getMaxHorizontalOffset(target)

    switch (mode) {
      case "negative":
        return -rawOffset
      case "positive-descending":
        return maxOffset - rawOffset
      default:
        return rawOffset
    }
  }

  protected toRawHorizontalOffset(logicalOffset: number, target: HTMLElement | null): number {
    if (!this.isHorizontal || !this.isRtl) return logicalOffset
    const mode = this.resolveRtlScrollBehavior(target)
    const maxOffset = this.getMaxHorizontalOffset(target)

    switch (mode) {
      case "negative":
        return -logicalOffset
      case "positive-descending":
        return maxOffset - logicalOffset
      default:
        return logicalOffset
    }
  }

  private getMaxHorizontalOffset(target: HTMLElement | null): number {
    if (!target) return 0
    const scrollWidth = Number(target.scrollWidth) || 0
    const clientWidth = Number(target.clientWidth) || 0
    return Math.max(0, scrollWidth - clientWidth)
  }

  private resolveRtlScrollBehavior(target: HTMLElement | null): RtlScrollBehavior {
    if (this.rtlScrollBehavior) return this.rtlScrollBehavior
    if (!target) {
      this.rtlScrollBehavior = "positive-ascending"
      return this.rtlScrollBehavior
    }

    this.rtlScrollBehavior = this.detectRtlScrollBehavior(target)
    return this.rtlScrollBehavior
  }

  private detectRtlScrollBehavior(target: HTMLElement): RtlScrollBehavior {
    const maxOffset = this.getMaxHorizontalOffset(target)
    const previous = target.scrollLeft
    if (maxOffset > 0 && Math.abs(previous - maxOffset) <= 1) {
      return "positive-descending"
    }

    target.scrollLeft = 0
    const atZero = target.scrollLeft

    if (atZero > 0) {
      target.scrollLeft = previous
      return "positive-descending"
    }

    target.scrollLeft = 1
    const atOne = target.scrollLeft
    target.scrollLeft = previous

    return atOne === 0 ? "negative" : "positive-ascending"
  }

  getScrollState(): ScrollState {
    return this.getCurrentScrollState()
  }

  getScrollAnchor(): ScrollAnchor | null {
    this.calculateRange()
    if (this.range.startIndex < 0 || this.range.endIndex < 0) return null

    const { count } = this.options
    const scrollMargin = this.getScrollMargin()
    const viewportStart = this.scrollOffset + scrollMargin
    const anchorIndex = Math.min(count - 1, Math.max(0, this.findIndexAtOffset(viewportStart)))
    const measurement = this.getMeasurement(anchorIndex)
    const key = this.getItemKey(anchorIndex)

    return { key, offset: viewportStart - measurement.start }
  }

  restoreScrollAnchor(anchor: ScrollAnchor): ScrollToIndexResult | null {
    const index = this.getIndexForKey(anchor.key)
    if (index === undefined) return null

    const measurement = this.getMeasurement(index)
    const targetOffset = measurement.start + anchor.offset - this.getScrollMargin()
    return this.scrollToOffset(targetOffset)
  }

  getRange(): Range {
    this.calculateRange()
    return { ...this.range }
  }

  getVisibleRange(): Range {
    const { count } = this.options
    if (count === 0 || this.viewportSize === 0) {
      return { startIndex: 0, endIndex: -1 }
    }

    const viewportStart = this.scrollOffset + this.getScrollMargin()
    return this.findVisibleRange(viewportStart, viewportStart + this.viewportSize)
  }

  protected forceUpdate({ reason }: RangeChangeReasonDetails = { reason: "manual" }): void {
    if (this.isDestroyed) return
    this.lastCalculatedOffset = -1
    this.cachedRangeStart = -1
    this.cachedRangeEnd = -2
    this.cachedVisibleRangeStart = -1
    this.cachedVisibleRangeEnd = -2
    this.measureCacheDirtyFrom = 0
    this.measureCache.clear()
    this.resetMeasurements()
    if (!this.shouldMeasureItems()) {
      this.cancelPendingConvergence()
      for (const cleanup of this.resizeObserverCleanups.values()) cleanup()
      this.resizeObserverCleanups.clear()
      this.pendingSizeUpdates.clear()
      this.sizeUpdateFrame.cancel()
    }
    this.remeasureTrackedElements()
    if (!this.isScrolling) this.observeUnobservedElements()
    this.calculateRange({ reason })
    this.notifyStore()
  }

  protected shouldMeasureItems(): boolean {
    return true
  }

  private remeasureTrackedElements(): boolean {
    if (!this.shouldMeasureItems()) return false
    const { count } = this.options
    let changed = false
    let minIndex = Infinity

    for (const [index, element] of this.elementsByIndex) {
      if (index < 0 || index >= count) continue

      const size = this.readMeasuredSizeFromElement(element as HTMLElement, index)
      if (size <= 0) continue

      if (this.onItemMeasured(index, size)) {
        changed = true
        if (index < minIndex) minIndex = index
      }
    }

    if (changed) {
      this.invalidateMeasurements(minIndex)
    }

    return changed
  }

  /**
   * Measures a newly rendered item right away, so the next render positions it correctly.
   * A ResizeObserver then tracks later size changes; it is set up once scrolling stops.
   */
  private attachItemElement(index: number, element: HTMLElement): void {
    const prevElement = this.elementsByIndex.get(index)
    if (prevElement && prevElement !== element) this.detachItemElement(index, prevElement)

    this.elementsByIndex.set(index, element)
    this.indexByElement.set(element, index)
    this.hasMeasuredItems = true
    this.observeElementVisibility(element, index)
    if (!this.shouldMeasureItems()) return

    const size = this.readMeasuredSizeFromElement(element, index)
    if (size > 0) {
      const knownSize = this.getKnownItemSize(index)
      if (knownSize === undefined || knownSize !== size) {
        // Cached first, so the ResizeObserver's initial callback is a no-op
        this.itemSizeCache.set(index, size)
        this.measureElementSync(index, size)
        this.onMeasurementsChanged()
      }
    }

    if (!this.isScrolling) this.observeElementSize(element, index)
  }

  private detachItemElement(index: number, element: Element): void {
    if (this.elementsByIndex.get(index) === element) this.elementsByIndex.delete(index)
    this.indexByElement.delete(element)
    this.unobserveElement(element)
  }

  protected observeElementSize(element: Element, index: number): void {
    if (this.isDestroyed) return
    this.unobserveElementResize(element)
    if (!this.shouldMeasureItems()) return
    this.hasMeasuredItems = true

    const cleanup = resizeObserverBorderBox.observe(element, (entry) => {
      if (this.isDestroyed || !this.shouldMeasureItems()) return
      // Guard against queued RO callbacks firing for a stale element after the
      // ref slot has been reassigned to a different DOM node. Without this,
      // a removed element's final RO event can poison the surviving item's size.
      if (this.elementsByIndex.get(index) !== entry.target) return

      const { borderBoxSize } = entry
      const box = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }
      const measuredSize = this.isHorizontal ? box.inlineSize : box.blockSize
      const knownSize = this.getKnownItemSize(index)
      if (knownSize === undefined || knownSize !== measuredSize) {
        this.scheduleSizeUpdate(index, measuredSize, entry.target)
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

  protected observeElementVisibility(element: Element, index: number): void {
    if (this.isDestroyed) return
    if (!this.intersectionObserver) return
    this.intersectionObserver.observe(element, (isVisible) => {
      if (this.isDestroyed) return
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

  protected unobserveElement(element: Element): void {
    this.unobserveElementResize(element)
    this.intersectionObserver?.unobserve(element)
  }

  // ============================================
  // Smooth Scrolling API
  // ============================================

  protected smoothScrollTo(
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

  updateOptions(nextOptions: Partial<O>): void {
    if (this.isDestroyed) return
    const prev = { ...this.options }
    const preserveAnchor = nextOptions.preserveScrollAnchor ?? this.options.preserveScrollAnchor
    const shouldRestoreAnchor =
      preserveAnchor && nextOptions.count !== undefined && nextOptions.count !== this.options.count
    const anchor = shouldRestoreAnchor ? this.getScrollAnchor() : null

    Object.assign(this.options, nextOptions)
    if (nextOptions.dir !== undefined) {
      this.rtlScrollBehavior = null
    }

    // Check if anything actually changed
    let changed = false
    for (const key in nextOptions) {
      if (!isSameOption((prev as any)[key], (this.options as any)[key])) {
        changed = true
        break
      }
    }

    if (!changed) return

    // Retention isn't geometry: keep sizes measured outside the viewport.
    if (Object.keys(nextOptions).every((key) => key === "retainedIndexes")) {
      this.notifyStore()
      return
    }

    this.invalidateItemKeys()

    const reason: RangeChangeReason =
      nextOptions.count !== undefined && nextOptions.count !== prev.count ? "count" : "manual"

    if (reason === "count") {
      if (this.options.count > prev.count) this.endReachedArmed = true
      this.onItemsChanged()
    }

    this.forceUpdate({ reason })

    if (anchor) {
      this.restoreScrollAnchor(anchor)
    }
  }

  /** Regular method (not a class field) so subclasses can override with `super`. */
  destroy(): void {
    this.isDestroyed = true
    this.convergenceId++
    this.pendingSyncNotify = false
    this.scrollElement = null
    this.rtlScrollBehavior = null
    this.scrollCleanup?.()
    this.trackCleanup?.()
    this.scrollCleanup = undefined
    this.trackCleanup = undefined
    this.indexByElement.clear()

    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer)
      this.scrollEndTimer = null
    }
    if (this.pendingConvergenceRaf != null) {
      cancelAnimationFrame(this.pendingConvergenceRaf)
      this.pendingConvergenceRaf = null
    }
    if (this.pendingInitialOffsetRaf != null) {
      cancelAnimationFrame(this.pendingInitialOffsetRaf)
      this.pendingInitialOffsetRaf = null
    }

    for (const cleanup of this.resizeObserverCleanups.values()) {
      cleanup()
    }
    this.resizeObserverCleanups.clear()

    this.scrollElementResizeCleanup?.()
    this.intersectionObserver?.disconnect()
    delete this.scrollElementResizeCleanup
    delete this.intersectionObserver
    this.cancelSmoothScroll()
    this.sizeUpdateFrame.cancel()
    this.currentSmoothScroll = null

    this.measureCache.clear()
    this.itemSizeCache.clear()
    this.pendingSizeUpdates.clear()
    this.elementsByIndex.clear()
    this.virtualItemObjectCache.clear()
    this.keyIndexCache.clear()
    this.cachedVirtualItems = []
    this.cachedVirtualIndexes = []
    this.storeListeners.clear()
  }
}
