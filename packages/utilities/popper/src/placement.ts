import type { Placement } from "@floating-ui/dom"
import type { PlacementAlign, PlacementSide } from "./types"

export function isValidPlacement(v: string): v is Placement {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(v)
}

export function getPlacementDetails(placement: Placement) {
  const [side, align] = placement.split("-") as [PlacementSide, PlacementAlign | undefined]
  return { side, align, hasAlign: align != null }
}

export function getPlacementSide(placement: Placement): PlacementSide {
  return placement.split("-")[0] as PlacementSide
}
