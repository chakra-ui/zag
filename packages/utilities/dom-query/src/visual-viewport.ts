import { getWindow } from "./node"
import { addDomEvent } from "./event"

export interface ViewportSize {
  width: number
  height: number
}

export function trackVisualViewport(doc: Document, fn: (data: ViewportSize) => void) {
  const win = getWindow(doc)
  const onResize = () => {
    fn?.(getViewportSize(win))
  }
  onResize()
  return addDomEvent(win.visualViewport ?? win, "resize", onResize)
}

function getViewportSize(win: Window): ViewportSize {
  return {
    width: win.visualViewport?.width || win.innerWidth,
    height: win.visualViewport?.height || win.innerHeight,
  }
}
