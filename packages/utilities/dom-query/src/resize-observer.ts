import { getWindow } from "./node"

type Subscriber<T> = (entry: T) => void

interface SharedResizeObserver {
  observe: (element: Element, listener: Subscriber<ResizeObserverEntry>) => () => void
  unobserve: (element: Element) => void
}

function createSharedResizeObserver(options?: ResizeObserverOptions): SharedResizeObserver {
  const listeners = new WeakMap<Element, Set<Subscriber<ResizeObserverEntry>>>()
  let observer: ResizeObserver | undefined

  const entries = new WeakMap<Element, ResizeObserverEntry>()

  const getObserver = (win: typeof globalThis): ResizeObserver => {
    if (observer) return observer

    observer = new win.ResizeObserver((observedEntries) => {
      for (const entry of observedEntries) {
        entries.set(entry.target, entry)
        const elementListeners = listeners.get(entry.target)
        if (elementListeners) {
          for (const listener of elementListeners) {
            listener(entry)
          }
        }
      }
    })

    return observer
  }

  const observe = (element: Element, listener: Subscriber<ResizeObserverEntry>) => {
    let elementListeners = listeners.get(element) || new Set()
    elementListeners.add(listener)

    listeners.set(element, elementListeners)

    const win = getWindow(element)
    getObserver(win).observe(element, options)

    return () => {
      const elementListeners = listeners.get(element)
      if (!elementListeners) return

      elementListeners.delete(listener)

      if (elementListeners.size === 0) {
        listeners.delete(element)
        getObserver(win).unobserve(element)
      }
    }
  }

  const unobserve = (element: Element) => {
    listeners.delete(element)
    observer?.unobserve(element)
  }

  return {
    observe,
    unobserve,
  }
}

export const resizeObserverContentBox = /* @__PURE__ */ createSharedResizeObserver({
  box: "content-box",
})

export const resizeObserverBorderBox = /* @__PURE__ */ createSharedResizeObserver({
  box: "border-box",
})

export const resizeObserverDevicePixelContentBox = /* @__PURE__ */ createSharedResizeObserver({
  box: "device-pixel-content-box",
})
