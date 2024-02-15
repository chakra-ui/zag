import { getComputedStyle } from "./get-computed-style"
import { isHTMLElement } from "./is"

export function getRenderedSize(element: Element) {
  const style = getComputedStyle(element)
  const isElement = isHTMLElement(element)

  let width = parseFloat(style.width) || 0
  let height = parseFloat(style.height) || 0

  const offsetWidth = isElement ? element.offsetWidth : width
  const offsetHeight = isElement ? element.offsetHeight : height

  const isTransformed = Math.round(width) !== offsetWidth || Math.round(height) !== offsetHeight

  if (isTransformed) {
    width = offsetWidth
    height = offsetHeight
  }

  return {
    width,
    height,
    isTransformed,
  }
}
