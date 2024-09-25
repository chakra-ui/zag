import { getWindow } from "@zag-js/dom-query"
import type { MachineContext, Offset } from "../tour.types"

type Rect = Required<MachineContext["currentRect"]>

export function getCenterRect(size: MachineContext["boundarySize"]) {
  return { x: size.width / 2, y: size.height / 2, width: 0, height: 0 }
}

function getFrameElement(win: Window): Element | null {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null
}

const normalizeEventPoint = (event: PointerEvent) => {
  let clientX = event.clientX
  let clientY = event.clientY

  let currentWin = event.view || window
  let currentIFrame = getFrameElement(currentWin)

  while (currentIFrame) {
    const iframeRect = currentIFrame.getBoundingClientRect()
    const css = getComputedStyle(currentIFrame)
    const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft))
    const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop))

    clientX += left
    clientY += top

    currentWin = getWindow(currentIFrame)
    currentIFrame = getFrameElement(currentWin)
  }

  return { clientX, clientY }
}

export function isEventInRect(rect: Rect, event: PointerEvent) {
  const { clientX, clientY } = normalizeEventPoint(event)
  return rect.y <= clientY && clientY <= rect.y + rect.height && rect.x <= clientX && clientX <= rect.x + rect.width
}

export function offset(r: Rect, i: Offset): Rect {
  const dx = i.x || 0
  const dy = i.y || 0
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy,
  }
}
