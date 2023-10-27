import { parseColor, type Color } from "@zag-js/color-utils"

export const parse = (color: string): Color => {
  const value = parseColor(color)

  const colorFormat = value.getFormat()
  const lockedFormat = colorFormat === "hsla" ? "hsla" : "hsba"

  const result = value.toFormat(lockedFormat)
  result.outputFormat = colorFormat

  return result
}
