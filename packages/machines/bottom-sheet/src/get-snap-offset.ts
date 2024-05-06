import type { MachineContext, SnapPoint } from "./bottom-sheet.types"

const isPercentage = (v: SnapPoint): v is `${number}%` => typeof v === "string" && v.endsWith("%")

export function getSnapOffsets(snapPoints: SnapPoint[], viewportHeight: MachineContext["viewportHeight"]) {
  return snapPoints.map((snapPoint) => {
    if (!isPercentage(snapPoint)) {
      return viewportHeight != null ? viewportHeight - snapPoint : snapPoint
    }
    const percent = parseFloat(snapPoint) / 100
    const height = percent * (viewportHeight ?? 0)
    return viewportHeight != null ? viewportHeight - height : height
  })
}
