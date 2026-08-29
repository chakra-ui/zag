import { getDocument, getWindow, isHTMLElement, setStyle, waitForElement } from "@zag-js/dom-query"
import { layerStack } from "./layer-stack"

const originalBodyPointerEvents = new WeakMap<HTMLElement, string>()

const layerObservers = new WeakMap<HTMLElement, MutationObserver>()

function getDesiredPointerEvents(node: HTMLElement): "auto" | "none" {
  return layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto"
}

function applyPointerEvents(node: HTMLElement) {
  const desired = getDesiredPointerEvents(node)
  if (node.style.pointerEvents !== desired) {
    node.style.pointerEvents = desired
  }
}

function ensurePointerEventsObserver(node: HTMLElement) {
  if (layerObservers.has(node)) return
  const win = getWindow(node)
  if (typeof win.MutationObserver === "undefined") return
  const observer = new win.MutationObserver(() => {
    if (!layerObservers.has(node)) return
    applyPointerEvents(node)
  })
  observer.observe(node, { attributes: true, attributeFilter: ["style"] })
  layerObservers.set(node, observer)
}

export function assignPointerEventToLayers() {
  layerStack.layers.forEach(({ node }) => {
    applyPointerEvents(node)
    ensurePointerEventsObserver(node)
  })
}

export function clearPointerEvent(node: HTMLElement) {
  const observer = layerObservers.get(node)
  if (observer) {
    observer.disconnect()
    layerObservers.delete(node)
  }
  node.style.pointerEvents = ""
}

/** Applies or restores body blocking from the current stack state. Safe to call at any time. */
function syncBodyPointerEvents(doc: Document) {
  const body = doc.body
  if (!body) return

  const shouldBlock = layerStack.hasPointerBlockingLayer()
  if (shouldBlock === body.hasAttribute("data-inert")) return

  if (shouldBlock) {
    originalBodyPointerEvents.set(body, body.style.pointerEvents)
    queueMicrotask(() => {
      if (!layerStack.hasPointerBlockingLayer()) return
      body.style.pointerEvents = "none"
      body.setAttribute("data-inert", "")
    })
    return
  }

  queueMicrotask(() => {
    if (layerStack.hasPointerBlockingLayer()) return
    const original = originalBodyPointerEvents.get(body)
    if (original !== undefined) {
      body.style.pointerEvents = original
      originalBodyPointerEvents.delete(body)
    }
    body.removeAttribute("data-inert")
    if (body.style.length === 0) body.removeAttribute("style")
  })
}

/**
 * Re-derives pointer blocking from the stack. Needed after a layer's `pointerBlocking` getter
 * changes value, since nothing was added or removed to trigger the usual sync.
 */
export function syncPointerEvents(node: HTMLElement) {
  syncBodyPointerEvents(getDocument(node))
  assignPointerEventToLayers()
}

export function disablePointerEventsOutside(node: HTMLElement, persistentElements?: Array<() => Element | null>) {
  const doc = getDocument(node)

  const cleanups: VoidFunction[] = []

  syncBodyPointerEvents(doc)

  persistentElements?.forEach((el) => {
    const [promise, abort] = waitForElement(
      () => {
        const node = el()
        return isHTMLElement(node) ? node : null
      },
      { timeout: 1000 },
    )
    promise.then((el) => cleanups.push(setStyle(el, { pointerEvents: "auto" })))
    cleanups.push(abort)
  })

  return () => {
    syncBodyPointerEvents(doc)
    cleanups.forEach((fn) => fn())
  }
}
