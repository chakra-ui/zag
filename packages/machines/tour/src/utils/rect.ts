import type { MachineContext } from "../tour.types"

type Rect = Required<MachineContext["currentRect"]>

export const getCenterRect = (size: MachineContext["windowSize"]) => {
  return { x: size.width / 2, y: size.height / 2, width: 0, height: 0 }
}

export const isEventInRect = (rect: Rect, event: PointerEvent) => {
  return (
    rect.y <= event.clientY &&
    event.clientY <= rect.y + rect.height &&
    rect.x <= event.clientX &&
    event.clientX <= rect.x + rect.width
  )
}

export function offset(r: Rect, i: [dx: number, dy: number]): Rect {
  const [dx = 0, dy = 0] = i
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy,
  }
}
