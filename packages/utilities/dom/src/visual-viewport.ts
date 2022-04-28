import { addDomEvent } from "./listener"

type ViewportSize = {
  width: number
  height: number
}

type Options = {
  document?: Document
  resolve?(data: ViewportSize): void
}

export function trackVisualViewport(options: Options) {
  const { document: doc, resolve } = options
  const win = doc?.defaultView || window
  resolve?.(getViewportSize(win))
  const onResize = () => resolve?.(getViewportSize(win))
  return addDomEvent(win.visualViewport ?? win, "resize", onResize)
}

function getViewportSize(win: Window): ViewportSize {
  return {
    width: win.visualViewport?.width || win.innerWidth,
    height: win.visualViewport?.height || win.innerHeight,
  }
}
