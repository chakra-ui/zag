import { getDocument, getWindow } from "../node"
import { noop } from "../shared"

export type IntersectionObserverListener = (entry: IntersectionObserverEntry) => void

export interface SharedIntersectionObserver {
  /**
   * Calls `listener` with each change in `target`'s visibility, starting with its current one
   */
  observe: (target: Element, listener: IntersectionObserverListener) => VoidFunction
}

interface ObserverEntry {
  observer: IntersectionObserver
  listeners: Map<Element, Set<IntersectionObserverListener>>
}

// the implicit root is the viewport, so those observers are kept per document
const observers = /* @__PURE__ */ new WeakMap<Element | Document, Map<string, ObserverEntry>>()

const getKey = ({ rootMargin = "0px", threshold = 0 }: IntersectionObserverInit) =>
  `${rootMargin}|${Array.isArray(threshold) ? threshold.join(",") : threshold}`

/** One native observer per root and options, shared by every target and subscription */
export function createSharedIntersectionObserver(options: IntersectionObserverInit = {}): SharedIntersectionObserver {
  const key = getKey(options)

  return {
    observe(target, listener) {
      const win = getWindow(target)
      if (typeof win.IntersectionObserver !== "function") return noop

      const root = options.root ?? getDocument(target)
      const byKey = observers.get(root) ?? new Map<string, ObserverEntry>()
      observers.set(root, byKey)

      let entry = byKey.get(key)
      if (!entry) {
        const listeners = new Map<Element, Set<IntersectionObserverListener>>()
        const observer = new win.IntersectionObserver((records) => {
          for (const record of records) {
            for (const fn of [...(listeners.get(record.target) ?? [])]) fn(record)
          }
        }, options)
        entry = { observer, listeners }
        byKey.set(key, entry)
      }

      const { observer, listeners } = entry
      const targetListeners = listeners.get(target) ?? new Set()
      listeners.set(target, targetListeners)

      // observing again reports the current visibility, which a new listener needs
      if (targetListeners.size > 0) observer.unobserve(target)
      // wrapped, so the same listener subscribed twice is released separately
      const callback: IntersectionObserverListener = (record) => listener(record)
      targetListeners.add(callback)
      observer.observe(target)

      return () => {
        if (!targetListeners.delete(callback) || targetListeners.size > 0) return
        listeners.delete(target)
        observer.unobserve(target)
        if (listeners.size > 0) return
        observer.disconnect()
        byKey.delete(key)
        if (byKey.size === 0) observers.delete(root)
      }
    },
  }
}
