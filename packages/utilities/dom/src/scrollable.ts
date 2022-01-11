import { getOwnerWindow, getOwnerDocument, getParent, isHTMLElement } from "./query"
import { getComputedStyle } from "./computed-style"

export function isScrollParent(el: HTMLElement | null): boolean {
  if (!el) return false
  const hasScrollableContent = el.scrollHeight > el.offsetHeight || el.scrollWidth > el.offsetWidth
  const { overflow, overflowX, overflowY } = getComputedStyle(el).value
  const hasOverflowStyle = /auto|scroll|overlay/.test(overflow + overflowY + overflowX)
  return hasOverflowStyle && hasScrollableContent
}

export function getScrollParent(el: HTMLElement): HTMLElement {
  const doc = getOwnerDocument(el)

  if (["html", "body", "#document"].includes(el.localName)) {
    return doc.body
  }

  if (isHTMLElement(el) && isScrollParent(el)) {
    return el
  }

  return getScrollParent(getParent(el))
}

type Target = Array<VisualViewport | Window | HTMLElement>

export function getScrollParents(el: HTMLElement, list: Target = []): Target {
  const scrollParent = getScrollParent(el)
  const isBody = scrollParent === getOwnerDocument(el).body
  const win = getOwnerWindow(scrollParent)

  const target = isBody
    ? ([win] as Target).concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : [])
    : scrollParent

  const parents = list.concat(target)

  if (isBody) {
    return parents
  }

  return parents.concat(getScrollParents(getParent(<HTMLElement>target)))
}

export function getScrollOffset(el: HTMLElement) {
  const parent = getScrollParent(el)

  if (parent)
    return {
      scrollTop: parent.scrollTop,
      scrollLeft: parent.scrollLeft,
    }

  const win = el ? getOwnerWindow(el) : null

  if (win)
    return {
      scrollTop: win.scrollY,
      scrollLeft: win.scrollX,
    }

  return { scrollTop: 0, scrollLeft: 0 }
}
