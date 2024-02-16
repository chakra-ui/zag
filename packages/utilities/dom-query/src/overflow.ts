import { getDocument, getWindow } from "./env"
import { getParentNode } from "./get-parent-node"
import { isHTMLElement, isRootElement, isVisualViewport } from "./is"
import { isOverflowElement } from "./is-overflow-element"

export type OverflowAncestor = Array<VisualViewport | Window | HTMLElement | null>

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

const getRect = (el: HTMLElement | Window | VisualViewport) => {
  if (isHTMLElement(el)) {
    return el.getBoundingClientRect()
  }

  if (isVisualViewport(el)) {
    return { top: 0, left: 0, bottom: el.height, right: el.width }
  }

  return { top: 0, left: 0, bottom: el.innerHeight, right: el.innerWidth }
}

export function isInView(el: HTMLElement | Window | VisualViewport, ancestor: HTMLElement | Window | VisualViewport) {
  if (!isHTMLElement(el)) return true

  const ancestorRect = getRect(ancestor)
  const elRect = el.getBoundingClientRect()

  return (
    elRect.top >= ancestorRect.top &&
    elRect.left >= ancestorRect.left &&
    elRect.bottom <= ancestorRect.bottom &&
    elRect.right <= ancestorRect.right
  )
}
