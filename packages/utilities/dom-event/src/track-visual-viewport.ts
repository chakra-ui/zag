import { addDomEvent } from "./add-dom-event"

export interface ViewportSize {
  width: number
  height: number
}

export function trackVisualViewport(doc: Document, fn: (data: ViewportSize) => void) {
  const win = doc?.defaultView || window

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
