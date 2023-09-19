const isDocument = (el: any): el is Document => el.nodeType === Node.DOCUMENT_NODE
const isNode = (el: any): el is Node => el.nodeType !== undefined
const isShadowRoot = (el: any): el is ShadowRoot =>
  el && isNode(el) && el.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in el

export function getDocument(el: Element | Node | Document | null) {
  if (isDocument(el)) return el
  return el?.ownerDocument ?? document
}

export function getWindow(el: Element | ShadowRoot | Document | undefined) {
  if (isShadowRoot(el)) return getWindow(el.host)
  if (isDocument(el)) return el.defaultView ?? window
  return el?.ownerDocument.defaultView ?? window
}
