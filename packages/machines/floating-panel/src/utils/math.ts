import type { Position, Size } from "../floating-panel.types"

export const addPosition = (a: Position, b: Position) => ({ x: a.x + b.x, y: a.y + b.y })
export const subtractPosition = (a: Position, b: Position) => ({ x: a.x - b.x, y: a.y - b.y })

export const addSize = (a: Size, b: Size) => ({ width: a.width + b.width, height: a.height + b.height })
export const subtractSize = (a: Size, b: Size) => ({ width: a.width - b.width, height: a.height - b.height })
