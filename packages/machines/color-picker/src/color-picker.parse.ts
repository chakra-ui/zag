import { parseColor, type Color } from "@zag-js/utils/color"

export const parse = (colorString: string): Color => {
  return parseColor(colorString)
}
