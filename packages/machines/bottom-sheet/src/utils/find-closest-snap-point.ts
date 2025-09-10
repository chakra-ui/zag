import type { ResolvedSnapPoint } from "../bottom-sheet.types"

export function findClosestSnapPoint(offset: number, snapPoints: ResolvedSnapPoint[]): ResolvedSnapPoint {
  return snapPoints.reduce((acc, curr) => {
    const closestDiff = Math.abs(offset - acc.offset)
    const currentDiff = Math.abs(offset - curr.offset)
    return currentDiff < closestDiff ? curr : acc
  })
}
