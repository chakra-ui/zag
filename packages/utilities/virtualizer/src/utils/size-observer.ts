import { resizeObserverBorderBox } from "@zag-js/dom-query"

export interface SizeObserverCallbacks {
  onResize?: (size: { width: number; height: number }) => void
}

/**
 * Observes and tracks container size changes
 */
export class SizeObserver {
  private element: Element | null = null
  private unobserveCallback: (() => void) | undefined = undefined
  private callbacks: SizeObserverCallbacks = {}
  private lastSize = { width: 0, height: 0 }

  constructor(callbacks: SizeObserverCallbacks = {}) {
    this.callbacks = callbacks
  }

  /**
   * Start observing an element's size
   */
  observe(element: Element): void {
    if (this.element === element) return

    this.unobserve()
    this.element = element

    this.unobserveCallback = resizeObserverBorderBox.observe(element, (entry) => {
      const { borderBoxSize } = entry
      const size = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }

      const newSize = {
        width: size.inlineSize,
        height: size.blockSize,
      }

      // Only notify if size actually changed
      if (newSize.width !== this.lastSize.width || newSize.height !== this.lastSize.height) {
        this.lastSize = newSize
        this.callbacks.onResize?.(newSize)
      }
    })
  }

  /**
   * Stop observing
   */
  unobserve(): void {
    if (this.unobserveCallback) {
      this.unobserveCallback()
      this.unobserveCallback = undefined
    }
    this.element = null
  }

  /**
   * Get current size
   */
  getCurrentSize(): { width: number; height: number } {
    return { ...this.lastSize }
  }

  /**
   * Set resize callback
   */
  setResizeCallback(callback: (size: { width: number; height: number }) => void): void {
    this.callbacks.onResize = callback
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.unobserve()
    this.callbacks = {}
  }
}
