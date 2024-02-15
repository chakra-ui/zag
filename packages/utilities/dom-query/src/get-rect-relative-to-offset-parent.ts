import { getDocumentElement } from "./env"
import { getBoundingClientRect } from "./get-bounding-client-rect"
import { getScrollPosition } from "./get-scroll-position"
import { getWindowScrollBarX } from "./get-windows-scroll"
import { getNodeName, isHTMLElement } from "./is"
import { isOverflowElement } from "./is-overflow-element"
import type { MeasurableElement } from "./types"

export function getRectRelativeToOffsetParent(
  element: MeasurableElement,
  offsetParent: Element | Window,
  fixed?: boolean,
) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent)
  const docEl = getDocumentElement(offsetParent)

  const rect = getBoundingClientRect(element, { includeScale: true, fixed, offsetParent })

  let scroll = { scrollLeft: 0, scrollTop: 0 }
  const offsets = { x: 0, y: 0 }

  if (isOffsetParentAnElement || (!isOffsetParentAnElement && !fixed)) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(docEl)) {
      scroll = getScrollPosition(offsetParent as HTMLElement)
    }

    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, { includeScale: true, fixed, offsetParent })
      offsets.x = offsetRect.x + offsetParent.clientLeft
      offsets.y = offsetRect.y + offsetParent.clientTop
    } else if (docEl) {
      offsets.x = getWindowScrollBarX(docEl)
    }
  }

  const x = rect.left + scroll.scrollLeft - offsets.x
  const y = rect.top + scroll.scrollTop - offsets.y

  return {
    x,
    y,
    width: rect.width,
    height: rect.height,
  }
}
