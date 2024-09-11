import { getDocument, setStyle, observeChildren, isHTMLElement } from "@zag-js/dom-query"
import { layerStack } from "./layer-stack"

let originalBodyPointerEvents: string

export function assignPointerEventToLayers() {
  layerStack.layers.forEach(({ node }) => {
    node.style.pointerEvents = layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto"
  })
}

export function clearPointerEvent(node: HTMLElement) {
  node.style.pointerEvents = ""
}

export function disablePointerEventsOutside(node: HTMLElement, persistentElements?: Array<() => Element | null>) {
  const doc = getDocument(node)

  const cleanups: VoidFunction[] = []

  if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
    originalBodyPointerEvents = document.body.style.pointerEvents
    queueMicrotask(() => {
      doc.body.style.pointerEvents = "none"
      doc.body.setAttribute("data-inert", "")
    })
  }

  if (persistentElements) {
    const persistedElementsMap = new Map<HTMLElement, () => void>()
    const persistedCleanup = observeChildren(doc.body, {
      callback: (records) => {
        for (const record of records) {
          if (record.type !== "childList") continue

          for (const node of record.addedNodes) {
            for (const fn of persistentElements) {
              const el = fn()
              if (isHTMLElement(el) && node.contains(el)) {
                const cleanup = setStyle(el, { pointerEvents: "auto" })
                persistedElementsMap.set(el, cleanup)
                cleanups.push(cleanup)
              }
            }
          }

          for (const node of record.removedNodes) {
            for (const [el, cleanup] of persistedElementsMap.entries()) {
              if (node.contains(el)) {
                cleanup()
                persistedElementsMap.delete(el)
                const index = cleanups.indexOf(cleanup)
                if (index > -1) {
                  cleanups.splice(index, 1)
                }
              }
            }
          }
        }
      },
    })
    cleanups.push(persistedCleanup)
    cleanups.push(() => persistedElementsMap.clear())
  }

  return () => {
    if (layerStack.hasPointerBlockingLayer()) return
    queueMicrotask(() => {
      doc.body.style.pointerEvents = originalBodyPointerEvents
      doc.body.removeAttribute("data-inert")
      if (doc.body.style.length === 0) doc.body.removeAttribute("style")
    })
    cleanups.forEach((fn) => fn())
  }
}
