import { Color, ColorChannel, parseColor } from "@zag-js/color-utils"
import { clamp, snapToStep, valueOf } from "@zag-js/number-utils"

export function getHueBackgroundImage() {
  return `linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)`
}

export function getSliderBgDirection(orientation: "vertical" | "horizontal", direction: "ltr" | "rtl") {
  if (orientation === "vertical") {
    return "top"
  } else if (direction === "ltr") {
    return "right"
  } else {
    return "left"
  }
}

export function getChannelDetails(color: Color, xChannel: ColorChannel, yChannel: ColorChannel) {
  const channels = color.getColorSpaceAxes({ xChannel, yChannel })

  const xChannelRange = color.getChannelRange(channels.xChannel)
  const yChannelRange = color.getChannelRange(channels.yChannel)

  const { minValue: minValueX, maxValue: maxValueX, step: stepX, pageSize: pageSizeX } = xChannelRange
  const { minValue: minValueY, maxValue: maxValueY, step: stepY, pageSize: pageSizeY } = yChannelRange

  const xValue = color.getChannelValue(channels.xChannel)
  const yValue = color.getChannelValue(channels.yChannel)

  return {
    channels,
    xChannelStep: stepX,
    yChannelStep: stepY,
    xChannelPageStep: pageSizeX,
    yChannelPageStep: pageSizeY,
    xValue,
    yValue,
    getThumbPosition(xValue: number, yValue: number) {
      let x = (xValue - minValueX) / (maxValueX - minValueX)
      let y = 1 - (yValue - minValueY) / (maxValueY - minValueY)
      return { x, y }
    },
    incrementX(stepSize: number) {
      return xValue + stepSize > maxValueX ? maxValueX : snapToStep(xValue + stepSize, minValueX)
    },
    incrementY(stepSize: number) {
      return yValue + stepSize > maxValueY ? maxValueY : snapToStep(yValue + stepSize, minValueY)
    },
    decrementX(stepSize: number) {
      return snapToStep(xValue - stepSize, minValueX)
    },
    decrementY(stepSize: number) {
      return snapToStep(yValue - stepSize, minValueY)
    },
    getColorFromPoint(x: number, y: number) {
      let newXValue = minValueX + clamp(x, { min: 0, max: 1 }) * (maxValueX - minValueX)
      let newYValue = minValueY + (1 - clamp(y, { min: 0, max: 1 })) * (maxValueY - minValueY)
      let newColor: Color | undefined

      if (newXValue !== xValue) {
        newXValue = valueOf(snapToStep(newXValue, minValueX))
        newColor = color.withChannelValue(channels.xChannel, newXValue)
      }

      if (newYValue !== yValue) {
        newYValue = valueOf(snapToStep(newYValue, minValueY))
        newColor = (newColor || color).withChannelValue(channels.yChannel, newYValue)
      }

      return { newColor, newXValue, newYValue }
    },
  }
}

export function getDisplayColor(color: Color, channel: ColorChannel) {
  switch (channel) {
    case "hue":
      return parseColor(`hsl(${color.getChannelValue("hue")}, 100%, 50%)`)
    case "lightness":
    case "brightness":
    case "saturation":
    case "red":
    case "green":
    case "blue":
      return color.withChannelValue("alpha", 1)
    case "alpha": {
      return color
    }
    default:
      throw new Error("Unknown color channel: " + channel)
  }
}
