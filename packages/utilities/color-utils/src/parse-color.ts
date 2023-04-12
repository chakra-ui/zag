import { HSBColor } from "./hsb-color"
import { HSLColor } from "./hsl-color"
import { RGBColor } from "./rgb-color"
import { ColorType } from "./types"

/** Parses a color from a string value. Throws an error if the string could not be parsed. */
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
