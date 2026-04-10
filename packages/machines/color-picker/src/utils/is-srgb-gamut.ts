import { type Color, isInSrgbGamut } from "@zag-js/color-utils"

/** Whether the color lies inside the sRGB cube (after conversion from the working space). */
export function isSrgbGamutColor(color: Color): boolean {
  return isInSrgbGamut(color)
}
