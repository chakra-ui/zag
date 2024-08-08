const ELEMENT_NODE: typeof Node.ELEMENT_NODE = 1
const DOCUMENT_NODE: typeof Node.DOCUMENT_NODE = 9
const DOCUMENT_FRAGMENT_NODE: typeof Node.DOCUMENT_FRAGMENT_NODE = 11

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null

export const isHTMLElement = (el: any): el is HTMLElement =>
  isObject(el) && el.nodeType === ELEMENT_NODE && typeof el.nodeName === "string"

export const isDocument = (el: any): el is Document => isObject(el) && el.nodeType === DOCUMENT_NODE

export const isWindow = (el: any): el is Window => isObject(el) && el === el.window

export const isVisualViewport = (el: any): el is VisualViewport =>
  isObject(el) && el.constructor.name === "VisualViewport"

export const getNodeName = (node: Node | Window): string => {
  if (isHTMLElement(node)) return node.localName || ""
  return "#document"
}

export function isRootElement(node: Node): boolean {
  return ["html", "body", "#document"].includes(getNodeName(node))
}

export const isNode = (el: any): el is Node => isObject(el) && el.nodeType !== undefined

export const isShadowRoot = (el: any): el is ShadowRoot =>
  isNode(el) && el.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in el
