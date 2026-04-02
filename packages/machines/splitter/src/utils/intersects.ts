import type { Rect } from "@zag-js/types"

export function intersects(r1: Rect, r2: Rect, strict: boolean = false): boolean {
  if (strict) {
    return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y
  }
  return r1.x <= r2.x + r2.width && r1.x + r1.width >= r2.x && r1.y <= r2.y + r2.height && r1.y + r1.height >= r2.y
}

export function toRect(r: DOMRect): Rect {
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}
