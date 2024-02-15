import { getRenderedSize } from "./get-rendered-size"

export function getRenderedScale(element: Element, rect = element.getBoundingClientRect()) {
  const { width, height, isTransformed } = getRenderedSize(element)

  let x = (isTransformed ? Math.round(rect.width) : rect.width) / width
  let y = (isTransformed ? Math.round(rect.height) : rect.height) / height

  if (!x || !Number.isFinite(x)) x = 1
  if (!y || !Number.isFinite(y)) y = 1

  return { x, y }
}
