import { isHTMLElement, isDocument, isShadowRoot, isWindow } from "./is"

export function getDocument(el: Element | Window | Node | Document | null | undefined) {
  if (isDocument(el)) return el
  if (isWindow(el)) return el.document
  return el?.ownerDocument ?? document
}

export function getDocumentElement(el: Element | Node | Window | Document | null | undefined): HTMLElement {
  return getDocument(el).documentElement
}

export function getWindow(el: Node | ShadowRoot | Document | null | undefined) {
  if (isShadowRoot(el)) return getWindow(el.host)
  if (isDocument(el)) return el.defaultView ?? window
  if (isHTMLElement(el)) return el.ownerDocument?.defaultView ?? window
  return window
}

export function getActiveElement(rootNode: Document | ShadowRoot): HTMLElement | null {
  let activeElement = rootNode.activeElement as HTMLElement | null

  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement as HTMLElement | null
    if (el === activeElement) break
    else activeElement = el
  }

  return activeElement
}
