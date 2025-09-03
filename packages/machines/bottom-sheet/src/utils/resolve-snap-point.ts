import type { ResolvedSnapPoint } from "../bottom-sheet.types"

export function resolveSnapPoint(snapPoint: number | string, containerHeight: number): ResolvedSnapPoint {
  if (typeof snapPoint === "number") {
    return {
      value: snapPoint,
      offset: containerHeight - snapPoint * containerHeight,
    }
  }
  if (typeof snapPoint === "string") {
    return {
      value: snapPoint,
      offset: containerHeight - parseFloat(snapPoint),
    }
  }
  throw new Error(`Invalid snap point: ${snapPoint}`)
}
