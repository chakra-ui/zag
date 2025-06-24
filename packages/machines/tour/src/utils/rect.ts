import { getWindow } from "@zag-js/dom-query"

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Point, Size {}

export function getCenterRect(size: Size) {
  return { x: size.width / 2, y: size.height / 2, width: 0, height: 0 }
}

function getFrameElement(win: Window): Element | null {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null
}

const normalizeEventPoint = (event: PointerEvent) => {
  let clientX = event.clientX
  let clientY = event.clientY

  let win = event.view || window
  let frame = getFrameElement(win)

  while (frame) {
    const iframeRect = frame.getBoundingClientRect()
    const css = getComputedStyle(frame)
    const left = iframeRect.left + (frame.clientLeft + parseFloat(css.paddingLeft))
    const top = iframeRect.top + (frame.clientTop + parseFloat(css.paddingTop))

    clientX += left
    clientY += top

    win = getWindow(frame)
    frame = getFrameElement(win)
  }

  return { clientX, clientY }
}

export function isEventInRect(rect: Rect, event: PointerEvent) {
  const { clientX, clientY } = normalizeEventPoint(event)
  return rect.y <= clientY && clientY <= rect.y + rect.height && rect.x <= clientX && clientX <= rect.x + rect.width
}

export function offset(r: Rect, i: Point): Rect {
  const dx = i.x || 0
  const dy = i.y || 0
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy,
  }
}
