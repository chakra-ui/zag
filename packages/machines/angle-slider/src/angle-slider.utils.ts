import { createRect, getPointAngle } from "@zag-js/rect-utils"
import type { Point } from "@zag-js/types"
import { mod, snapValueToStep } from "@zag-js/utils"

export const MIN_VALUE = 0
export const MAX_VALUE = 359

function mirrorAngle(angle: number) {
  return (360 - angle) % 360
}

export function getAngle(controlEl: HTMLElement, point: Point, angularOffset?: number | null, dir?: "ltr" | "rtl") {
  const rect = createRect(controlEl.getBoundingClientRect())
  let angle = getPointAngle(rect, point)

  // Apply angular offset for relative thumb dragging
  if (angularOffset != null) {
    return angle - angularOffset
  }

  // RTL: mirror angle (top-left → ~320° LTR, ~40° RTL)
  if (dir === "rtl") {
    angle = mirrorAngle(angle)
  }

  return angle
}

export function getPointerValue(
  controlEl: HTMLElement,
  point: Point,
  angularOffset: number | null | undefined,
  value: number,
  dir?: "ltr" | "rtl",
) {
  if (angularOffset == null) {
    return getAngle(controlEl, point, null, dir)
  }
  const angle = getAngle(controlEl, point)
  const clickAngle = value + angularOffset
  return dir === "rtl" ? value + clickAngle - angle : angle - angularOffset
}

export function getDisplayAngle(value: number, dir?: "ltr" | "rtl") {
  return dir === "rtl" ? mirrorAngle(value) : value
}

export function clampAngle(degree: number) {
  return Math.min(Math.max(degree, MIN_VALUE), MAX_VALUE)
}

export function constrainAngle(degree: number, step: number) {
  // Snap to the nearest step and wrap within [0, 360) so the control behaves
  // as a true circle (e.g. dragging past 0°/360° wraps instead of sticking).
  return mod(Math.round(degree / step) * step, 360)
}

export function snapAngleToStep(value: number, step: number) {
  return snapValueToStep(value, MIN_VALUE, MAX_VALUE, step)
}
