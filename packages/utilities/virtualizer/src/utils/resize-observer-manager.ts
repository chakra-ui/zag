import { resizeObserverBorderBox } from "@zag-js/dom-query"

type ResizeCallback = (size: { width: number; height: number }) => void

/**
 * Manages ResizeObserver instances for efficient item size tracking using Zag's dom-query
 */
export class ResizeObserverManager {
  private unobserveCallbacks = new Map<Element, () => void>()

  observe(element: Element, callback: ResizeCallback): void {
    // Unobserve first if already observing
    this.unobserve(element)

    const unobserve = resizeObserverBorderBox.observe(element, (entry) => {
      const { borderBoxSize } = entry
      const size = borderBoxSize?.[0] || {
        inlineSize: entry.contentRect.width,
        blockSize: entry.contentRect.height,
      }

      callback({
        width: size.inlineSize,
        height: size.blockSize,
      })
    })

    this.unobserveCallbacks.set(element, unobserve)
  }

  unobserve(element: Element): void {
    const unobserve = this.unobserveCallbacks.get(element)
    if (unobserve) {
      unobserve()
      this.unobserveCallbacks.delete(element)
    }
  }

  disconnect(): void {
    for (const unobserve of this.unobserveCallbacks.values()) {
      unobserve()
    }
    this.unobserveCallbacks.clear()
  }

  get isSupported(): boolean {
    return typeof ResizeObserver !== "undefined"
  }

  get observedCount(): number {
    return this.unobserveCallbacks.size
  }
}
