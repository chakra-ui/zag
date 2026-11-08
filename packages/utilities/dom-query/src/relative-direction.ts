import type { ActivationDirection, Orientation } from "@zag-js/types"

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
