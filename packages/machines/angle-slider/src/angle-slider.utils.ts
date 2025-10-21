import { createRect, getPointAngle } from "@zag-js/rect-utils"
import type { Point } from "@zag-js/types"
import { snapValueToStep } from "@zag-js/utils"

export const MIN_VALUE = 0
export const MAX_VALUE = 359

export function getAngle(controlEl: HTMLElement, point: Point, angularOffset?: number | null) {
  const rect = createRect(controlEl.getBoundingClientRect())
  const angle = getPointAngle(rect, point)

  // Apply angular offset for relative thumb dragging
  if (angularOffset != null) {
    return angle - angularOffset
  }

  return angle
}

export function clampAngle(degree: number) {
  return Math.min(Math.max(degree, MIN_VALUE), MAX_VALUE)
}

export function constrainAngle(degree: number, step: number) {
  const clampedDegree = clampAngle(degree)
  const upperStep = Math.ceil(clampedDegree / step)
  const nearestStep = Math.round(clampedDegree / step)
  return upperStep >= clampedDegree / step
    ? upperStep * step === MAX_VALUE
      ? MIN_VALUE
      : upperStep * step
    : nearestStep * step
}

export function snapAngleToStep(value: number, step: number) {
  return snapValueToStep(value, MIN_VALUE, MAX_VALUE, step)
}
