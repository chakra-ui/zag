import { getDocument, setStyle, waitForElements } from "@zag-js/dom-query"
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

export function disablePointerEventsOutside(node: HTMLElement, peristentElements?: Array<() => Element | null>) {
  const doc = getDocument(node)

  const cleanups: VoidFunction[] = []

  if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
    originalBodyPointerEvents = document.body.style.pointerEvents
    queueMicrotask(() => {
      doc.body.style.pointerEvents = "none"
      doc.body.setAttribute("data-inert", "")
    })
  }

  if (peristentElements) {
    const persistedCleanup = waitForElements(peristentElements, (el) => {
      cleanups.push(setStyle(el, { pointerEvents: "auto" }))
    })
    cleanups.push(persistedCleanup)
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
