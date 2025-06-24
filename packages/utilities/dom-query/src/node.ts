import { isObject } from "./shared"

const ELEMENT_NODE: typeof Node.ELEMENT_NODE = 1
const DOCUMENT_NODE: typeof Node.DOCUMENT_NODE = 9
const DOCUMENT_FRAGMENT_NODE: typeof Node.DOCUMENT_FRAGMENT_NODE = 11

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

export const isInputElement = (el: any): el is HTMLInputElement => isHTMLElement(el) && el.localName === "input"

export const isAnchorElement = (el: HTMLElement | null | undefined): el is HTMLAnchorElement => !!el?.matches("a[href]")

export const isElementVisible = (el: Node) => {
  if (!isHTMLElement(el)) return false
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
}

const TEXTAREA_SELECT_REGEX = /(textarea|select)/

export function isEditableElement(el: HTMLElement | EventTarget | null) {
  if (el == null || !isHTMLElement(el)) return false
  try {
    return (
      (isInputElement(el) && el.selectionStart != null) ||
      TEXTAREA_SELECT_REGEX.test(el.localName) ||
      el.isContentEditable ||
      el.getAttribute("contenteditable") === "true" ||
      el.getAttribute("contenteditable") === ""
    )
  } catch {
    return false
  }
}

type Target = HTMLElement | EventTarget | null | undefined

export function contains(parent: Target, child: Target) {
  if (!parent || !child) return false
  if (!isHTMLElement(parent) || !isHTMLElement(child)) return false
  const rootNode = child.getRootNode?.()
  if (parent === child) return true
  if (parent.contains(child)) return true
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child
    while (next) {
      if (parent === next) return true
      // @ts-ignore
      next = next.parentNode || next.host
    }
  }
  return false
}

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

export function getParentNode(node: Node): Node {
  if (getNodeName(node) === "html") return node
  const result =
    (node as any).assignedSlot || node.parentNode || (isShadowRoot(node) && node.host) || getDocumentElement(node)
  return isShadowRoot(result) ? result.host : result
}
