import { clampValue } from "@zag-js/utils"

export const getSlidesPerMove = (slidesPerMove: number | "auto", slidesPerPage: number) =>
  slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove

export const isSnapTarget = (index: number, perMove: number) => (index + perMove) % perMove === 0

export const getPageForIndex = (index: number, perMove: number, pageCount: number) => {
  if (perMove <= 0 || pageCount <= 0) return
  return clampValue(Math.floor(index / perMove), 0, pageCount - 1)
}

export const getClosestSnapIndex = (snapPoints: number[], position: number) =>
  snapPoints.reduce(
    (closest, point, index) =>
      Math.abs(point - position) < Math.abs(snapPoints[closest] - position) ? index : closest,
    0,
  )

export function getPageSnapPoints(
  totalSlides: number | undefined,
  slidesPerMove: number | "auto",
  slidesPerPage: number,
) {
  // If there are no total slides or if slidesPerPage is 0, do nothing.
  if (totalSlides == null || slidesPerPage <= 0) {
    return []
  }

  const snapPoints: number[] = []
  const perMove = getSlidesPerMove(slidesPerMove, slidesPerPage)

  // An additional safety check in case perMove becomes 0 through other means
  if (perMove <= 0) {
    return []
  }

  for (let i = 0; i < totalSlides; i += perMove) {
    // Ensure we don't create a snap point that would go beyond the available slides
    if (i + slidesPerPage > totalSlides) break
    snapPoints.push(i)
  }
  return snapPoints
}
