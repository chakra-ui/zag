import { getDocument, isHTMLElement, setStyle, waitForElement } from "@zag-js/dom-query"
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
    originalBodyPointerEvents = doc.body.style.pointerEvents
    queueMicrotask(() => {
      const body = doc.body
      if (!body) return
      body.style.pointerEvents = "none"
      body.setAttribute("data-inert", "")
    })
  }

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
    if (layerStack.hasPointerBlockingLayer()) return
    queueMicrotask(() => {
      const body = doc.body
      if (!body) return
      body.style.pointerEvents = originalBodyPointerEvents
      body.removeAttribute("data-inert")
      if (body.style.length === 0) body.removeAttribute("style")
    })
    cleanups.forEach((fn) => fn())
  }
}
