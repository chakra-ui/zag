import type { Color, ColorChannel } from "@zag-js/color-utils"
import { getPercentValue, snapValueToStep } from "@zag-js/numeric-range"

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
    getThumbPosition() {
      let x = (xValue - minValueX) / (maxValueX - minValueX)
      let y = 1 - (yValue - minValueY) / (maxValueY - minValueY)
      return { x, y }
    },
    incrementX(stepSize: number) {
      return xValue + stepSize > maxValueX ? maxValueX : snapValueToStep(xValue + stepSize, minValueX, maxValueX, stepX)
    },
    incrementY(stepSize: number) {
      return yValue + stepSize > maxValueY ? maxValueY : snapValueToStep(yValue + stepSize, minValueY, maxValueY, stepY)
    },
    decrementX(stepSize: number) {
      return snapValueToStep(xValue - stepSize, minValueX, maxValueX, stepX)
    },
    decrementY(stepSize: number) {
      return snapValueToStep(yValue - stepSize, minValueY, maxValueY, stepY)
    },
    getColorFromPoint(x: number, y: number) {
      let newXValue = getPercentValue(x, minValueX, maxValueX, stepX)
      let newYValue = getPercentValue(1 - y, minValueY, maxValueY, stepY)

      let newColor: Color | undefined

      if (newXValue !== xValue) {
        newXValue = snapValueToStep(newXValue, minValueX, maxValueX, stepX)
        newColor = color.withChannelValue(channels.xChannel, newXValue)
      }

      if (newYValue !== yValue) {
        newYValue = snapValueToStep(newYValue, minValueY, maxValueY, stepY)
        newColor = (newColor || color).withChannelValue(channels.yChannel, newYValue)
      }

      return newColor
    },
  }
}
