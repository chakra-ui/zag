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

  let dir = false

  let alphaValue = (zValue - zMin) / (zMax - zMin)
  let isHSL = color.getFormat() === "hsla"

  switch (zChannel) {
    case "red": {
      dir = xChannel === "green"
      return generateRGB_R(orientation, dir, zValue)
    }

    case "green": {
      dir = xChannel === "red"
      return generateRGB_G(orientation, dir, zValue)
    }

    case "blue": {
      dir = xChannel === "red"
      return generateRGB_B(orientation, dir, zValue)
    }

    case "hue": {
      dir = xChannel !== "saturation"
      if (color.getFormat() === "oklch") {
        return generateOKLCH_H(orientation, dir, zValue)
      }
      if (isHSL) {
        return generateHSL_H(orientation, dir, zValue)
      }
      return generateHSB_H(orientation, dir, zValue)
    }

    case "saturation": {
      dir = xChannel === "hue"
      if (isHSL) {
        return generateHSL_S(orientation, dir, alphaValue)
      }
      return generateHSB_S(orientation, dir, alphaValue)
    }

    case "brightness": {
      dir = xChannel === "hue"
      return generateHSB_B(orientation, dir, alphaValue)
    }

    case "lightness": {
      if (color.getFormat() === "oklab") {
        return generateOKLAB_L(orientation, dir, zValue)
      }
      dir = xChannel === "hue"
      return generateHSL_L(orientation, dir, zValue)
    }
    default:
      return { areaStyles: {}, areaGradientStyles: {} }
  }
}
