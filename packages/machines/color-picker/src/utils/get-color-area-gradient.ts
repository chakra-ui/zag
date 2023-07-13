import type { ColorChannel } from "@zag-js/color-utils"
import type { Style } from "@zag-js/types"
import type { MachineContext } from "../color-picker.types"
import {
  generateHSB_B,
  generateHSB_H,
  generateHSB_S,
  generateHSL_H,
  generateHSL_L,
  generateHSL_S,
  generateRGB_B,
  generateRGB_G,
  generateRGB_R,
} from "./generate-format-background"

export function getColorAreaGradient(ctx: MachineContext, xChannel: ColorChannel, yChannel: ColorChannel) {
  const value = ctx.valueAsColor

  const { zChannel } = value.getColorSpaceAxes({ xChannel, yChannel })
  const zValue = value.getChannelValue(zChannel)

  const { minValue: zMin, maxValue: zMax } = value.getChannelRange(zChannel)
  const orientation: [string, string] = ["top", ctx.dir === "rtl" ? "left" : "right"]

  let dir = false
  let background = { areaStyles: {} as Style, areaGradientStyles: {} as Style }

  let alphaValue = (zValue - zMin) / (zMax - zMin)
  let isHSL = value.getColorSpace() === "hsl"

  switch (zChannel) {
    case "red": {
      dir = xChannel === "green"
      background = generateRGB_R(orientation, dir, zValue)
      break
    }

    case "green": {
      dir = xChannel === "red"
      background = generateRGB_G(orientation, dir, zValue)
      break
    }

    case "blue": {
      dir = xChannel === "red"
      background = generateRGB_B(orientation, dir, zValue)
      break
    }

    case "hue": {
      dir = xChannel !== "saturation"
      if (isHSL) {
        background = generateHSL_H(orientation, dir, zValue)
      } else {
        background = generateHSB_H(orientation, dir, zValue)
      }
      break
    }

    case "saturation": {
      dir = xChannel === "hue"
      if (isHSL) {
        background = generateHSL_S(orientation, dir, alphaValue)
      } else {
        background = generateHSB_S(orientation, dir, alphaValue)
      }
      break
    }

    case "brightness": {
      dir = xChannel === "hue"
      background = generateHSB_B(orientation, dir, alphaValue)
      break
    }

    case "lightness": {
      dir = xChannel === "hue"
      background = generateHSL_L(orientation, dir, zValue)
      break
    }
  }

  return background
}
