import { parseColor, type Color } from "@zag-js/color-utils"

export const parse = (colorString: string): Color => {
  return parseColor(colorString)
}
