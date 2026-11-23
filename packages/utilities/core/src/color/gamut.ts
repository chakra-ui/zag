import { isLinearRgbInSrgbGamut, oklabToLinearRgb } from "./math"
import type { ColorType } from "./types"

export function isInSrgbGamut(color: ColorType): boolean {
  const lab = color.toFormat("oklab")
  return isLinearRgbInSrgbGamut(
    oklabToLinearRgb([lab.getChannelValue("lightness"), lab.getChannelValue("a"), lab.getChannelValue("b")]),
  )
}
