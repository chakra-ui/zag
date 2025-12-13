type VisibilityCallback = (isVisible: boolean, entry: IntersectionObserverEntry) => void

/**
 * Manages IntersectionObserver for tracking item visibility
 */
export class IntersectionObserverManager {
  private observer: IntersectionObserver | null = null
  private callbacks = new WeakMap<Element, VisibilityCallback>()
  private observedElements = new Set<Element>()
  private readonly options: IntersectionObserverInit

  constructor(options: IntersectionObserverInit = {}) {
    this.options = {
      rootMargin: "50px",
      threshold: 0,
      ...options,
    }

    if (typeof IntersectionObserver !== "undefined") {
      this.observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback(entry.isIntersecting, entry)
          }
        }
      }, this.options)
    }
  }

  observe(element: Element, callback: VisibilityCallback): void {
    if (!this.observer) return

    this.callbacks.set(element, callback)

    if (!this.observedElements.has(element)) {
      this.observer.observe(element)
      this.observedElements.add(element)
    }
  }

  unobserve(element: Element): void {
    if (!this.observer) return

    this.callbacks.delete(element)

    if (this.observedElements.has(element)) {
      this.observer.unobserve(element)
      this.observedElements.delete(element)
    }
  }

  updateRoot(root: Element | null): void {
    if (!this.observer) return

    // Recreate observer with new root
    const oldCallbacks = new Map()
    const oldElements = Array.from(this.observedElements)

    // Save current state
    for (const element of oldElements) {
      const callback = this.callbacks.get(element)
      if (callback) {
        oldCallbacks.set(element, callback)
      }
    }

    // Disconnect old observer
    this.disconnect()

    // Create new observer with updated root
    this.options.root = root
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const callback = this.callbacks.get(entry.target)
        if (callback) {
          callback(entry.isIntersecting, entry)
        }
      }
    }, this.options)

    // Re-observe with new observer
    for (const [element, callback] of oldCallbacks) {
      this.observe(element, callback)
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.callbacks = new WeakMap()
      this.observedElements.clear()
    }
  }

  get isSupported(): boolean {
    return typeof IntersectionObserver !== "undefined"
  }

  get observedCount(): number {
    return this.observedElements.size
  }
}
