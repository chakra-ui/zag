import { getWindow } from "./env"
import { getComputedStyle } from "./get-computed-style"
import { getRenderedScale } from "./get-rendered-scale"
import { getVisualOffsets, shouldAddVisualOffsets } from "./get-visual-offset"
import { isHTMLElement } from "./is"
import type { MeasurableElement } from "./types"

function resolveElement(e: MeasurableElement): Element | undefined {
  return !isHTMLElement(e) ? (e as any).contextElement : e
}

export interface BoundingClientRectOptions {
  includeScale?: boolean
  fixed?: boolean
  offsetParent?: Element | Window
}

export function getBoundingClientRect(virtualOrElement: MeasurableElement, options: BoundingClientRectOptions = {}) {
  const { includeScale = false, fixed = false, offsetParent } = options

  const rect = virtualOrElement.getBoundingClientRect()
  const element = resolveElement(virtualOrElement)

  let scale = { x: 1, y: 1 }

  if (includeScale) {
    if (offsetParent) {
      if (isHTMLElement(offsetParent)) {
        scale = getRenderedScale(offsetParent)
      }
    } else if (isHTMLElement(element)) {
      scale = getRenderedScale(element, rect)
    }
  }

  const visualOffsets = shouldAddVisualOffsets(element, fixed, offsetParent)
    ? getVisualOffsets(element)
    : { x: 0, y: 0 }

  let x = (rect.left + visualOffsets.x) / scale.x
  let y = (rect.top + visualOffsets.y) / scale.y

  let width = rect.width / scale.x
  let height = rect.height / scale.y

  let win = getWindow(element)

  if (!element) {
    return win.DOMRect.fromRect({ width, height, x, y })
  }

  const offsetWin = offsetParent && isHTMLElement(offsetParent) ? getWindow(offsetParent) : offsetParent

  let frameEl = win.frameElement

  while (frameEl && offsetParent && offsetWin !== win) {
    const iframeRect = frameEl.getBoundingClientRect()
    const iframeScale = getRenderedScale(frameEl, iframeRect)

    const css = getComputedStyle(frameEl)

    const left = iframeRect.left + (frameEl.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x
    const top = iframeRect.top + (frameEl.clientTop + parseFloat(css.paddingTop)) * iframeScale.y

    x *= iframeScale.x
    y *= iframeScale.y
    width *= iframeScale.x
    height *= iframeScale.y

    x += left
    y += top

    win = getWindow(frameEl)
    frameEl = win.frameElement
  }

  return win.DOMRect.fromRect({ width, height, x, y })
}
