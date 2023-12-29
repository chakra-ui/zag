import { isHTMLElement } from "@zag-js/dom-query"
import type { AnchorRect, MaybeRectElement } from "./types"

export function createDOMRect(x = 0, y = 0, width = 0, height = 0) {
  if (typeof DOMRect === "function") {
    return new DOMRect(x, y, width, height)
  }
  const rect = {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
  }
  return { ...rect, toJSON: () => rect }
}

function getDOMRect(anchorRect?: AnchorRect | null) {
  if (!anchorRect) return createDOMRect()
  const { x, y, width, height } = anchorRect
  return createDOMRect(x, y, width, height)
}

export function getAnchorElement(
  anchorElement: MaybeRectElement,
  getAnchorRect?: (anchor: MaybeRectElement) => AnchorRect | null,
) {
  return {
    contextElement: isHTMLElement(anchorElement) ? anchorElement : undefined,
    getBoundingClientRect: () => {
      const anchor = anchorElement
      const anchorRect = getAnchorRect?.(anchor)
      if (anchorRect || !anchor) {
        return getDOMRect(anchorRect)
      }
      return anchor.getBoundingClientRect()
    },
  }
}
