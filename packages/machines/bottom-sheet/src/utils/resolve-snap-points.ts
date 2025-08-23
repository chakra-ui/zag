import type { SnapPoint } from "../bottom-sheet.types"

export function resolveSnapPoints(snapPoints: SnapPoint[], containerHeight: number): number[] {
  return snapPoints.map((point) => {
    if (typeof point === "number") return point
    if (typeof point === "string" && point.endsWith("%")) {
      const percent = parseFloat(point) / 100
      return containerHeight * percent
    }
    throw new Error(`Invalid snap point: ${point}`)
  })
}
