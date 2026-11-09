import type { ActivationDirection, Orientation, PopupActivationDirection } from "@zag-js/types"

export interface RelativeDirectionOptions {
  /** When omitted, the axis with the larger movement wins */
  orientation?: Orientation | undefined
}

export function getRelativeDirection(
  fromEl: Element | null | undefined,
  toEl: Element | null | undefined,
  options: RelativeDirectionOptions = {},
): ActivationDirection {
  if (!fromEl || !toEl || fromEl === toEl) return "none"

  const fromRect = fromEl.getBoundingClientRect()
  const toRect = toEl.getBoundingClientRect()
  const dx = toRect.left - fromRect.left
  const dy = toRect.top - fromRect.top

  const { orientation = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical" } = options

  if (orientation === "horizontal") {
    if (dx === 0) return "none"
    return dx > 0 ? "right" : "left"
  }

  if (dy === 0) return "none"
  return dy > 0 ? "down" : "up"
}

const POPUP_DIRECTION_TOLERANCE = 5

/** Compares element centers on both axes, e.g. `"right"` or `"left down"` */
export function getPopupActivationDirection(
  fromEl: Element | null | undefined,
  toEl: Element | null | undefined,
): PopupActivationDirection | null {
  if (!fromEl || !toEl || fromEl === toEl) return null

  const from = getCenter(fromEl)
  const to = getCenter(toEl)
  const dx = to.x - from.x
  const dy = to.y - from.y

  const horizontal = dx > POPUP_DIRECTION_TOLERANCE ? "right" : dx < -POPUP_DIRECTION_TOLERANCE ? "left" : null
  const vertical = dy > POPUP_DIRECTION_TOLERANCE ? "down" : dy < -POPUP_DIRECTION_TOLERANCE ? "up" : null

  if (horizontal && vertical) return `${horizontal} ${vertical}`
  return horizontal ?? vertical
}

function getCenter(el: Element) {
  const rect = el.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}
