import { getComputedStyle } from "./get-computed-style"
import { getNodeName, getDocument, getWindow, getParent, isHTMLElement, isWindow } from "./query"

export function isScrollParent(el: HTMLElement): boolean {
  const { overflow, overflowX, overflowY } = getComputedStyle(el)
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX)
}

export function getScrollParent(el: HTMLElement): HTMLElement {
  if (["html", "body", "#document"].includes(getNodeName(el))) {
    return getDocument(el).body
  }

  if (isHTMLElement(el) && isScrollParent(el)) {
    return el
  }

  return getScrollParent(getParent(el))
}

type Target = Array<VisualViewport | Window | HTMLElement>

export function getScrollParents(el: HTMLElement, list: Target = []): Target {
  const scrollParent = getScrollParent(el)
  const isBody = scrollParent === getDocument(el).body
  const win = getWindow(scrollParent)

  const target = isBody
    ? ([win] as Target).concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : [])
    : scrollParent

  const parents = list.concat(target)
  if (isBody) return parents

  return parents.concat(getScrollParents(getParent(<HTMLElement>target)))
}

export function getScrollOffset(el: HTMLElement) {
  if (isWindow(el)) {
    return { scrollLeft: el.scrollX, scrollTop: el.scrollY }
  }

  return { scrollLeft: el.scrollLeft, scrollTop: el.scrollTop }
}
