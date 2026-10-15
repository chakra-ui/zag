import { clampValue } from "@zag-js/utils"

export const getSlidesPerMove = (slidesPerMove: number | "auto", slidesPerPage: number) =>
  slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove

export const isSnapTarget = (index: number, perMove: number) => (index + perMove) % perMove === 0

export const getPageForIndex = (index: number, perMove: number, pageCount: number) => {
  if (perMove <= 0 || pageCount <= 0) return
  return clampValue(Math.floor(index / perMove), 0, pageCount - 1)
}

export interface DragSample {
  time: number
  delta: number
}

const VELOCITY_WINDOW = 100
// A pause this long before release reads as "place it here", not a flick
const IDLE_TIMEOUT = 50
const FLICK_VELOCITY = 0.3
const FLICK_DISTANCE = 10

// Release velocity in scroll units per ms, or 0 when the drag didn't end in a flick
export const getReleaseVelocity = (samples: DragSample[], releaseTime: number, distance: number) => {
  const last = samples[samples.length - 1]
  if (!last || releaseTime - last.time > IDLE_TIMEOUT || Math.abs(distance) < FLICK_DISTANCE) return 0
  let sum = 0
  let start = releaseTime
  for (const sample of samples) {
    if (releaseTime - sample.time > VELOCITY_WINDOW) continue
    sum += sample.delta
    start = Math.min(start, sample.time)
  }
  const velocity = sum / Math.max(releaseTime - start, 16)
  return Math.abs(velocity) < FLICK_VELOCITY ? 0 : velocity
}

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
