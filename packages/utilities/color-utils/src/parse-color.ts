import { HSBColor } from "./hsb-color"
import { HSLColor } from "./hsl-color"
import { RGBColor } from "./rgb-color"
import type { ColorType } from "./types"

export function parseColor(value: string): ColorType {
  let result = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value)
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
