import { HSBColor } from "./hsb-color"
import { HSLColor } from "./hsl-color"
import { nativeColorMap } from "./native-color"
import { RGBColor } from "./rgb-color"
import type { ColorType } from "./types"

export const parseColor = (value: string): ColorType => {
  if (nativeColorMap.has(value)) {
    return parseColor(nativeColorMap.get(value)!)
  }

  const result = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value)

  if (!result) {
    const error = new Error("Invalid color value: " + value)
    Error.captureStackTrace?.(error, parseColor)
    throw error
  }

  return result
}

export const normalizeColor = (v: string | ColorType) => {
  return typeof v === "string" ? parseColor(v) : v
}
