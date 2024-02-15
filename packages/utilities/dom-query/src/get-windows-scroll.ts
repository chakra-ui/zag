import { getDocumentElement } from "./env"
import { getBoundingClientRect } from "./get-bounding-client-rect"
import { getScrollPosition } from "./get-scroll-position"

export function getWindowScrollBarX(element: Element): number {
  return getBoundingClientRect(getDocumentElement(element)).left + getScrollPosition(element as HTMLElement).scrollLeft
}
