import type { MoveDetails } from "../dnd.types"

export interface MoveTarget {
  target: string
  placement: "before" | "after"
}

/**
 * Where `value` lands when moved `to` a new position in `order`.
 * `values` are the items moving together (the value, plus any selected items).
 */
export function getMoveTarget(order: string[], values: string[], details: MoveDetails): MoveTarget | null {
  const { value, to } = details
  const moving = new Set(values)
  const index = order.indexOf(value)
  if (index === -1) return null

  const others = order.filter((item) => !moving.has(item))
  if (others.length === 0) return null

  switch (to) {
    case "prev": {
      const target = order.slice(0, index).findLast((item) => !moving.has(item))
      return target ? { target, placement: "before" } : null
    }
    case "next": {
      const target = order.slice(index + 1).find((item) => !moving.has(item))
      return target ? { target, placement: "after" } : null
    }
    case "first": {
      const target = others[0]
      return order.indexOf(target) < index ? { target, placement: "before" } : null
    }
    case "last": {
      const target = others[others.length - 1]
      return order.indexOf(target) > index ? { target, placement: "after" } : null
    }
  }
}
