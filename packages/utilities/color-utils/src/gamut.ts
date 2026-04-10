import type { ColorType } from "./types"
import { isLinearRgbInSrgbGamut, oklabToLinearRgb } from "./oklab-math"

/** Whether the color lies inside the sRGB gamut (checks in linear RGB space, no clamping). */
export function isInSrgbGamut(color: ColorType): boolean {
  const oklab = color.toFormat("oklab")
  const L = oklab.getChannelValue("lightness")
  const a = oklab.getChannelValue("a")
  const b = oklab.getChannelValue("b")
  return isLinearRgbInSrgbGamut(oklabToLinearRgb(L, a, b))
}
