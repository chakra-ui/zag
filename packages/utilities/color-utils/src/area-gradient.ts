import type { Color } from "./color"
import {
  generateRGB_R,
  generateRGB_G,
  generateRGB_B,
  generateHSL_H,
  generateHSB_H,
  generateHSL_S,
  generateHSB_S,
  generateHSB_B,
  generateHSL_L,
  generateOKLAB_L,
  generateOKLCH_H,
  generateOKLCH_L,
  generateOKLCH_C,
  generateOKLAB_A,
  generateOKLAB_B,
} from "./color-format-gradient"
import type { ColorChannel } from "./types"

interface GradientOptions {
  xChannel: ColorChannel
  yChannel: ColorChannel
  dir?: "rtl" | "ltr" | undefined
}

interface GradientStyles {
  areaStyles: Record<string, string>
  areaGradientStyles: Record<string, string>
}

export function getColorAreaGradient(color: Color, options: GradientOptions): GradientStyles {
  const { xChannel, yChannel, dir: dirProp = "ltr" } = options

  const { zChannel } = color.getColorAxes({ xChannel, yChannel })
  const zValue = color.getChannelValue(zChannel)
  const { minValue: zMin, maxValue: zMax } = color.getChannelRange(zChannel)
  const orientation: [string, string] = ["top", dirProp === "rtl" ? "left" : "right"]

  let alphaValue = (zValue - zMin) / (zMax - zMin)
  let isHSL = color.getFormat() === "hsla"

  switch (zChannel) {
    case "red": {
      return generateRGB_R(orientation, xChannel === "green", zValue)
    }

    case "green": {
      return generateRGB_G(orientation, xChannel === "red", zValue)
    }

    case "blue": {
      return generateRGB_B(orientation, xChannel === "red", zValue)
    }

    case "hue": {
      if (color.getFormat() === "oklch") {
        return generateOKLCH_H(orientation, xChannel === "chroma", zValue)
      }
      const dir = xChannel !== "saturation"
      if (isHSL) {
        return generateHSL_H(orientation, dir, zValue)
      }
      return generateHSB_H(orientation, dir, zValue)
    }

    case "saturation": {
      const dir = xChannel === "hue"
      if (isHSL) {
        return generateHSL_S(orientation, dir, alphaValue)
      }
      return generateHSB_S(orientation, dir, alphaValue)
    }

    case "a":
      return generateOKLAB_A(orientation, xChannel === "lightness", zValue)
    case "b":
      return generateOKLAB_B(orientation, xChannel === "lightness", zValue)
    case "brightness":
      return generateHSB_B(orientation, xChannel === "hue", alphaValue)
    case "chroma":
      return generateOKLCH_C(orientation, xChannel === "lightness", zValue)

    case "lightness": {
      if (color.getFormat() === "oklab") {
        return generateOKLAB_L(orientation, xChannel === "a", zValue)
      }
      if (color.getFormat() === "oklch") {
        return generateOKLCH_L(orientation, xChannel === "chroma", zValue)
      }
      return generateHSL_L(orientation, xChannel === "hue", zValue)
    }
    default:
      return { areaStyles: {}, areaGradientStyles: {} }
  }
}
