import { parseColor, type Color } from "@zag-js/color-utils"
import { ref } from "@zag-js/core"

export const parse = (color: string): Color => {
  const value = parseColor(color)

  const colorFormat = value.getFormat()
  const lockedFormat = colorFormat.startsWith("hsl") ? "hsla" : "hsba"

  const result = value.toFormat(lockedFormat)
  result.outputFormat = colorFormat

  return ref(result)
}
