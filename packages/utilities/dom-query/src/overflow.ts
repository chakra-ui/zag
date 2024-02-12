import { getDocument, getWindow } from "./env"
import { getParentNode } from "./get-parent-node"
import { isHTMLElement, isRootElement } from "./is"
import { isOverflowElement } from "./is-overflow-element"

type OverflowAncestor = Array<VisualViewport | Window | HTMLElement | null>

export function getNearestOverflowAncestor(el: Node): HTMLElement {
  const parentNode = getParentNode(el)

  if (isRootElement(parentNode)) {
    return getDocument(parentNode).body
  }

  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode
  }

  return getNearestOverflowAncestor(parentNode)
}

export function getOverflowAncestors(el: HTMLElement, list: OverflowAncestor = []): OverflowAncestor {
  const scrollableAncestor = getNearestOverflowAncestor(el)
  const isBody = scrollableAncestor === el.ownerDocument.body
  const win = getWindow(scrollableAncestor)

  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [])
  }

  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []))
}
