import { getDocument } from "@zag-js/dom-query"
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

const DATA_ATTR = "data-inert"

export function disablePointerEventsOutside(node: HTMLElement) {
  const doc = getDocument(node)

  if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute(DATA_ATTR)) {
    originalBodyPointerEvents = document.body.style.pointerEvents
    doc.body.style.pointerEvents = "none"
    doc.body.setAttribute(DATA_ATTR, "")
  }

  return () => {
    if (layerStack.hasPointerBlockingLayer()) return
    doc.body.style.pointerEvents = originalBodyPointerEvents
    doc.body.removeAttribute(DATA_ATTR)
    if (doc.body.style.length === 0) doc.body.removeAttribute("style")
  }
}
