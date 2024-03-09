import type { Rect } from "../floating-panel.types"

export function getIntersection(r1: Rect, r2: Rect) {
  const xOverlap = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x))
  const yOverlap = Math.max(0, Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y))

  const intersectionRect =
    xOverlap > 0 && yOverlap > 0
      ? {
          x: Math.max(r1.x, r2.x),
          y: Math.max(r1.y, r2.y),
          width: xOverlap,
          height: yOverlap,
        }
      : null

  const intersectionArea = intersectionRect ? intersectionRect.width * intersectionRect.height : 0

  const r1Area = r1.width * r1.height
  const r2Area = r2.width * r2.height

  const unionArea = r1Area + r2Area - intersectionArea

  const intersectionRatio = unionArea > 0 ? intersectionArea / unionArea : 0
  const isIntersecting = intersectionRatio > 0

  return {
    isIntersecting,
    intersectionRatio,
    intersectionRect,
  }
}
