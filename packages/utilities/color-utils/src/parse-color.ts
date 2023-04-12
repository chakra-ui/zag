import { parseHexColor } from "./hex-color"
import { HSBColor } from "./hsb-color"
import { HSLColor } from "./hsl-color"
import { RGBColor } from "./rgb-color"
import { ColorType } from "./types"

export function parseColor(value: string): ColorType {
  let result = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value) || parseHexColor(value)
  if (!result) {
    throw new Error("Invalid color value: " + value)
  }
  return result
}

export function normalizeColor(v: string | ColorType) {
  if (typeof v === "string") {
    return parseColor(v)
  } else {
    return v
  }
}

export const isValidColor = (v: string | ColorType) => {
  try {
    normalizeColor(v)
    return true
  } catch (e) {
    return false
  }
}
