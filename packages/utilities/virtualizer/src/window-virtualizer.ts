import { getComputedStyle, getDocumentElement, isHTMLElement, resizeObserverBorderBox } from "@zag-js/dom-query"
import { ListVirtualizer } from "./list-virtualizer"
import type { CSSProperties, ListVirtualizerOptions, ScrollToIndexOptions, ScrollToIndexResult } from "./types"

type WindowType = Window & typeof globalThis

/**
 * Walk up from `el` to find the first ancestor whose computed `overflow-x` (horizontal) or
 * `overflow-y` (vertical) is `auto`, `scroll`, or `overlay`.
 *
 * Returns `null` when no scrollable ancestor is found (scroll falls through to `window`).
 * If auto-detection picks the wrong element, set `scrollingElement` explicitly in the options.
 */
function findScrollableParent(el: HTMLElement | null, horizontal: boolean): HTMLElement | null {
  let p: HTMLElement | null = el
  while (p) {
    const { overflowX, overflowY } = getComputedStyle(p)
    const ax = horizontal ? overflowX : overflowY
    if (ax === "auto" || ax === "scroll" || ax === "overlay") {
      return p
    }
    p = p.parentElement
  }
  return null
}

export interface WindowVirtualizerOptions extends ListVirtualizerOptions {
  /**
   * Explicit scroll container for listening to scroll events and computing viewport size.
   *
   * If omitted, the virtualizer auto-detects the nearest scrollable ancestor of the
   * virtualizer root (e.g. a `<main>` with `overflow-y: auto`). When no scrollable
   * ancestor is found, `window` is used.
   *
   * Set this when auto-detection picks the wrong element (e.g. nested scroll regions).
   */
  scrollingElement?: Element

  /**
   * Fixed offset (px) between the scroll origin and the start of the virtualized content.
   *
   * Comparable to TanStack Virtual's `scrollMargin`. The virtualizer already derives offset
   * dynamically from the root element's `getBoundingClientRect()`, so this is only needed for
   * additional corrections (e.g. sticky headers, CSS transforms that shift the root).
   */
  windowOffset?: number

  /** Function to get the `window` object. Override for iframe or SSR environments. */
  getWindow?: () => WindowType
}

/**
 * Virtualizer for "outer" scrolling — `window`, or an ancestor overflow container
 * (e.g. `<main style="overflow-y: auto">`) rather than the virtualizer root itself.
 *
 * Scroll offset is derived from the root's `getBoundingClientRect()` so item positions
 * stay in list-space regardless of where the scroll originates. Programmatic scrolling
 * (`scrollTo`, `scrollToIndex`) targets the detected scroll container or `window`.
 */
export class WindowVirtualizer extends ListVirtualizer {
  private windowOptions: WindowVirtualizerOptions
  private windowScrollHandler?: VoidFunction
  private windowResizeHandler?: VoidFunction
  /** Where we listen for scroll — `window` or a scrollable ancestor (e.g. `main` with overflow-y: auto). */
  private scrollListenerTarget: EventTarget | null = null
  /** Cleanup for ResizeObserver on the scroll parent (when it is an HTMLElement, not `window`). */
  private scrollTargetResizeCleanup: VoidFunction | undefined
  private getWindow: () => WindowType

  /**
   * `ListVirtualizer` may call `setViewportSize` during `super()` when `initialSize` is set — before
   * `this.getWindow` / `this.windowOptions` are assigned, so always resolve via `this.options` or global.
   */
  private resolveWindow(): WindowType | undefined {
    const bound = (this as unknown as { getWindow?: () => WindowType }).getWindow
    if (typeof bound === "function") {
      return bound()
    }
    return (
      (this.options as WindowVirtualizerOptions).getWindow?.() ?? (typeof window !== "undefined" ? window : undefined)
    )
  }

  constructor(options: WindowVirtualizerOptions) {
    super(options)
    this.windowOptions = options
    this.getWindow = options.getWindow ?? (() => window)
    this.setupWindowScrolling()
  }

  private setupWindowScrolling(): void {
    this.windowScrollHandler = () => {
      const offset = this.getWindowScrollOffset()

      // Create a mock event that matches the expected interface
      const mockEvent = {
        currentTarget: {
          scrollTop: this.options.horizontal ? 0 : offset,
          scrollLeft: this.options.horizontal ? offset : 0,
        },
      }

      this.handleScroll(mockEvent)
    }

    this.windowResizeHandler = () => {
      if (this.scrollElement) {
        this.measure()
      }
      this.windowScrollHandler?.()
    }

    // Resize only — scroll is attached in `init()` once we know the scroll root (window vs overflow parent).
    const win = this.resolveWindow()
    if (typeof win !== "undefined") {
      win.addEventListener("resize", this.windowResizeHandler, { passive: true })
    }
  }

  private attachScrollListener(scrollElement: HTMLElement): void {
    this.detachScrollListener()

    const win = this.resolveWindow()
    const explicit = this.windowOptions.scrollingElement
    const target = explicit ?? findScrollableParent(scrollElement, this.options.horizontal) ?? win ?? null

    this.scrollListenerTarget = target

    if (this.windowScrollHandler && target) {
      target.addEventListener("scroll", this.windowScrollHandler, { passive: true })
    }

    this.observeScrollTarget(target)
  }

  /**
   * When the scroll target is an HTMLElement (not `window`), observe its size with `ResizeObserver`
   * so `viewportSize` stays correct even if the element resizes without a window resize event.
   */
  private observeScrollTarget(target: EventTarget | null): void {
    this.scrollTargetResizeCleanup?.()
    this.scrollTargetResizeCleanup = undefined

    if (!target || !isHTMLElement(target)) return

    const { horizontal } = this.options
    let lastWidth = 0
    let lastHeight = 0

    this.scrollTargetResizeCleanup = resizeObserverBorderBox.observe(target, (entry) => {
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
        super.setViewportSize(horizontal ? width : height)
      }
    })
  }

  private detachScrollListener(): void {
    if (this.windowScrollHandler && this.scrollListenerTarget) {
      this.scrollListenerTarget.removeEventListener("scroll", this.windowScrollHandler)
    }
    this.scrollTargetResizeCleanup?.()
    this.scrollTargetResizeCleanup = undefined
    this.scrollListenerTarget = null
  }

  override init(scrollElement: HTMLElement): void {
    this.attachScrollListener(scrollElement)
    super.init(scrollElement)
    // Sync scroll offset after layout so `scrollOffset` matches list-space coordinates (not raw `pageYOffset`).
    queueMicrotask(() => this.windowScrollHandler?.())
  }

  /**
   * Scroll offset along the virtual list axis, in the same space as {@link ItemMeasurement} `start` / `end`.
   * Uses the scroll root’s position in the viewport — not document `pageYOffset` alone.
   */
  private getWindowScrollOffset(): number {
    const win = this.resolveWindow()
    const windowOffset =
      this.windowOptions?.windowOffset ?? (this.options as WindowVirtualizerOptions).windowOffset ?? 0
    const { horizontal } = this.options

    if (!win) {
      return 0
    }

    const root = this.scrollElement
    if (root) {
      const rect = root.getBoundingClientRect()
      if (horizontal) {
        return -rect.left - windowOffset
      }
      return -rect.top - windowOffset
    }

    const rootElement = getDocumentElement(win)
    const scrollingElement =
      this.windowOptions?.scrollingElement ?? (this.options as WindowVirtualizerOptions).scrollingElement ?? rootElement

    if (horizontal) {
      return (scrollingElement.scrollLeft || win.pageXOffset || 0) - windowOffset
    }
    return (scrollingElement.scrollTop || win.pageYOffset || 0) - windowOffset
  }

  override getContainerStyle(): CSSProperties {
    const baseStyle = super.getContainerStyle()
    // Override container style for window scrolling — avoid `contain: strict` on huge in-flow content.
    return {
      ...baseStyle,
      overflow: "visible",
      position: "static",
      contain: "none",
    }
  }

  override getContentStyle(): CSSProperties {
    const baseStyle = super.getContentStyle()
    const windowOffset = this.windowOptions.windowOffset ?? 0

    return {
      ...baseStyle,
      position: "relative",
      marginTop: this.options.horizontal ? 0 : windowOffset,
      marginLeft: this.options.horizontal ? windowOffset : 0,
    }
  }

  override getScrollHandler(): typeof this.handleScroll {
    // Window scrolling doesn't use a scroll handler on the container (scroll is on `window`).
    return () => {}
  }

  /**
   * List-space offsets are applied to `window` / the scroll parent in `scrollTo` — not to the virtualizer root
   * (which is not the scroll container and must not receive `scrollTop` = list offset).
   */
  protected override shouldApplyScrollToScrollElement(): boolean {
    return false
  }

  override setViewportSize(_size: number): void {
    const win = this.resolveWindow()
    const { horizontal } = this.options
    const target = this.scrollListenerTarget ?? win

    let size: number
    if (target && target !== win && isHTMLElement(target)) {
      size = horizontal ? target.clientWidth : target.clientHeight
    } else {
      if (typeof win === "undefined") return
      size = horizontal ? win.innerWidth : win.innerHeight
    }

    super.setViewportSize(size)
  }

  override scrollTo(offset: number): { scrollTop?: number; scrollLeft?: number } {
    const win = this.resolveWindow()
    const el = this.scrollElement
    const { horizontal } = this.options
    const windowOffset = this.windowOptions.windowOffset ?? 0
    const scrollTarget = this.scrollListenerTarget ?? win

    if (el && scrollTarget) {
      if (scrollTarget === win) {
        if (typeof win !== "undefined") {
          const rect = el.getBoundingClientRect()
          if (horizontal) {
            const docOrigin = win.pageXOffset + rect.left
            win.scrollTo(docOrigin + offset - windowOffset, win.pageYOffset)
          } else {
            const docOrigin = win.pageYOffset + rect.top
            win.scrollTo(win.pageXOffset, docOrigin + offset - windowOffset)
          }
        }
      } else if (isHTMLElement(scrollTarget)) {
        const delta = offset - this.scrollOffset
        if (horizontal) {
          scrollTarget.scrollLeft += delta
        } else {
          scrollTarget.scrollTop += delta
        }
      }
    }

    return super.scrollTo(offset)
  }

  override scrollToIndex(index: number, options: ScrollToIndexOptions = {}): ScrollToIndexResult {
    const { align = "start", smooth } = options
    if (!smooth) return super.scrollToIndex(index, options)

    const targetOffset = this.resolveScrollToOffset(index, align)
    if (targetOffset === null) {
      return this.options.horizontal ? { scrollLeft: this.scrollOffset } : { scrollTop: this.scrollOffset }
    }

    const { horizontal } = this.options
    const scrollTarget = this.scrollListenerTarget ?? this.resolveWindow()

    if (isHTMLElement(scrollTarget)) {
      const el = this.scrollElement
      if (el) {
        const rect = el.getBoundingClientRect()
        const containerRect = scrollTarget.getBoundingClientRect()
        const relativeOffset = horizontal
          ? rect.left - containerRect.left + scrollTarget.scrollLeft
          : rect.top - containerRect.top + scrollTarget.scrollTop
        scrollTarget.scrollTo({
          [horizontal ? "left" : "top"]: relativeOffset + targetOffset,
          behavior: "smooth",
        })
      }
    } else {
      const win = this.resolveWindow()
      const el = this.scrollElement
      if (win && el) {
        const windowOffset = this.windowOptions.windowOffset ?? 0
        const rect = el.getBoundingClientRect()
        const docOrigin = horizontal ? win.pageXOffset + rect.left : win.pageYOffset + rect.top
        win.scrollTo({
          [horizontal ? "left" : "top"]: docOrigin + targetOffset - windowOffset,
          behavior: "smooth",
        })
      }
    }

    return super.scrollTo(targetOffset)
  }

  override destroy(): void {
    this.detachScrollListener()

    const win = this.resolveWindow()
    if (this.windowResizeHandler && typeof win !== "undefined") {
      win.removeEventListener("resize", this.windowResizeHandler)
    }

    super.destroy()
  }
}
