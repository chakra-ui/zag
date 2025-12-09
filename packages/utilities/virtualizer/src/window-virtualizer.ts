import { getDocumentElement } from "@zag-js/dom-query"
import { ListVirtualizer } from "./list-virtualizer"
import type { ListVirtualizerOptions } from "./types"

interface WindowVirtualizerOptions extends ListVirtualizerOptions {
  /** Use window scrolling instead of container scrolling */
  useWindowScroll: true
  /** Element to measure scroll offset against (defaults to window) */
  scrollingElement?: Element
  /** Offset from window top/left where content starts */
  windowOffset?: number
  /** Function to get the window */
  getWindow?: () => typeof window
}

/**
 * Virtualizer that uses window scrolling instead of container scrolling
 */
export class WindowVirtualizer extends ListVirtualizer {
  private windowOptions: WindowVirtualizerOptions
  private windowScrollHandler?: () => void
  private getWindow: () => typeof window

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

    // Listen to window scroll events
    const win = this.getWindow()
    if (typeof win !== "undefined") {
      win.addEventListener("scroll", this.windowScrollHandler, { passive: true })
      win.addEventListener("resize", this.windowScrollHandler, { passive: true })
    }
  }

  private getWindowScrollOffset(): number {
    const win = this.getWindow()
    const rootElement = getDocumentElement(win)

    const { horizontal, scrollingElement = rootElement } = this.windowOptions

    const windowOffset = this.windowOptions.windowOffset ?? 0

    if (horizontal) {
      return (scrollingElement.scrollLeft || win.pageXOffset || 0) - windowOffset
    } else {
      return (scrollingElement.scrollTop || win.pageYOffset || 0) - windowOffset
    }
  }

  getContainerStyle() {
    const baseStyle = super.getContainerStyle()
    // Override container style for window scrolling
    return {
      ...baseStyle,
      overflow: "visible",
      position: "static",
    }
  }

  getContentStyle() {
    const baseStyle = super.getContentStyle()
    const windowOffset = this.windowOptions.windowOffset ?? 0

    return {
      ...baseStyle,
      position: "relative",
      marginTop: this.options.horizontal ? 0 : windowOffset,
      marginLeft: this.options.horizontal ? windowOffset : 0,
    }
  }

  getScrollHandler(): any {
    // Window scrolling doesn't use a scroll handler on the container
    return undefined
  }

  setViewportSize = (): void => {
    const win = this.getWindow()
    if (typeof win === "undefined") return
    const windowSize = this.options.horizontal ? win.innerWidth : win.innerHeight
    super.setViewportSize(windowSize)
  }

  scrollTo = (offset: number): { scrollTop?: number; scrollLeft?: number } => {
    const win = this.getWindow()

    const { horizontal } = this.options
    const windowOffset = this.windowOptions.windowOffset ?? 0
    const targetOffset = offset + windowOffset

    if (typeof win !== "undefined") {
      if (horizontal) {
        win.scrollTo(targetOffset, win.pageYOffset)
      } else {
        win.scrollTo(win.pageXOffset, targetOffset)
      }
    }

    return horizontal ? { scrollLeft: targetOffset } : { scrollTop: targetOffset }
  }

  scrollToIndex(
    index: number,
    options: { align?: "start" | "center" | "end"; behavior?: ScrollBehavior } = {},
  ): { scrollTop?: number; scrollLeft?: number } {
    const win = this.getWindow()
    const { behavior = "auto" } = options
    const targetScroll = super.scrollToIndex(index, options)

    if (typeof win !== "undefined") {
      const { horizontal } = this.options
      const windowOffset = this.windowOptions.windowOffset ?? 0

      if (horizontal && targetScroll.scrollLeft !== undefined) {
        win.scrollTo({
          left: targetScroll.scrollLeft + windowOffset,
          behavior,
        })
      } else if (!horizontal && targetScroll.scrollTop !== undefined) {
        win.scrollTo({
          top: targetScroll.scrollTop + windowOffset,
          behavior,
        })
      }
    }

    return targetScroll
  }

  destroy(): void {
    const win = this.getWindow()
    // Remove window scroll listeners
    if (this.windowScrollHandler && typeof win !== "undefined") {
      win.removeEventListener("scroll", this.windowScrollHandler)
      win.removeEventListener("resize", this.windowScrollHandler)
    }

    super.destroy()
  }
}
