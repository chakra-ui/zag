import { clampValue } from "@zag-js/utils/number"

export const getSlidesPerMove = (slidesPerMove: number | "auto", slidesPerPage: number) =>
  slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove

export const isSnapTarget = (index: number, perMove: number) => (index + perMove) % perMove === 0

export const getPageForIndex = (index: number, perMove: number, pageCount: number) => {
  if (perMove <= 0 || pageCount <= 0) return
  return clampValue(Math.floor(index / perMove), 0, pageCount - 1)
}

const FLICK_VELOCITY = 0.3
const FLICK_DISTANCE = 10

// The release velocity in scroll units per ms, or 0 when the drag was too short or slow to be a flick
export const getFlickVelocity = (velocity: number, distance: number) =>
  Math.abs(distance) < FLICK_DISTANCE || Math.abs(velocity) < FLICK_VELOCITY ? 0 : velocity

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
