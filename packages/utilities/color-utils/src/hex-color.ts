import { RGBColor } from "./rgb-color"
import { ColorType } from "./types"
import { toFixedNumber } from "./utils"

export const parseHexColor = (hex: string): ColorType => {
  if (hex[0] === "#") hex = hex.substring(1)

  if (hex.length < 6) {
    return new RGBColor(
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
      hex.length === 4 ? toFixedNumber(parseInt(hex[3] + hex[3], 16) / 255, 2) : 1,
    )
  }

  return new RGBColor(
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
    hex.length === 8 ? toFixedNumber(parseInt(hex.substring(6, 8), 16) / 255, 2) : 1,
  )
}
