import { getWindow } from "./env"
import { isWebKit } from "./platform"

export function getVisualOffsets(e: Element | undefined) {
  const w = getWindow(e)
  if (!isWebKit() || !w.visualViewport) return { x: 0, y: 0 }
  const { offsetLeft: x, offsetTop: y } = w.visualViewport
  return { x, y }
}

export function shouldAddVisualOffsets(
  e: Element | undefined,
  fixed = false,
  offsetParent?: Element | Window | undefined,
): boolean {
  if (!offsetParent || (fixed && offsetParent !== getWindow(e))) return false
  return fixed
}
