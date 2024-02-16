import type { MachineContext, Offset } from "../tour.types"

type Rect = Required<MachineContext["currentRect"]>

export function getCenterRect(size: MachineContext["boundarySize"]) {
  return { x: size.width / 2, y: size.height / 2, width: 0, height: 0 }
}

export function isEventInRect(rect: Rect, event: PointerEvent) {
  return (
    rect.y <= event.clientY &&
    event.clientY <= rect.y + rect.height &&
    rect.x <= event.clientX &&
    event.clientX <= rect.x + rect.width
  )
}

export function offset(r: Rect, i: Offset): Rect {
  const dx = i.x || 0
  const dy = i.y || 0
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy,
  }
}
