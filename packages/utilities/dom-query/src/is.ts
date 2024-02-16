export const isHTMLElement = (v: any): v is HTMLElement =>
  typeof v === "object" && v?.nodeType === Node.ELEMENT_NODE && typeof v?.nodeName === "string"

export const isDocument = (el: any): el is Document => el.nodeType === Node.DOCUMENT_NODE

export const isWindow = (el: any): el is Window => el != null && el === el.window

export const isVisualViewport = (el: any): el is VisualViewport =>
  el != null && el.constructor.name === "VisualViewport"

export const getNodeName = (node: Node | Window): string => {
  if (isHTMLElement(node)) return node.localName || ""
  return "#document"
}

export function isRootElement(node: Node): boolean {
  return ["html", "body", "#document"].includes(getNodeName(node))
}

export const isNode = (el: any): el is Node => el.nodeType !== undefined

export const isShadowRoot = (el: any): el is ShadowRoot =>
  el && isNode(el) && el.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in el
