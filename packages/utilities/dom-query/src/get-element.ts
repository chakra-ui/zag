import { isDocument } from "./is-element"

export function getDocument(el: Element | Node | Document | null) {
  if (isDocument(el)) return el
  return el?.ownerDocument ?? document
}

export function getRootNode(el: Node) {
  return el.getRootNode() as Document | ShadowRoot
}

export function getWindow(el: Element | Node | Document | null): Window & typeof globalThis {
  return getDocument(el).defaultView ?? window
}
