import { clampValue, getPercentValue, getValuePercent, snapValueToStep } from "@zag-js/numeric-range"
import type {
  Color2DAxes,
  ColorAxes,
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorStringFormat,
  ColorType,
} from "./types"

const isEqualObject = (a: Record<string, number>, b: Record<string, number>): boolean => {
  if (Object.keys(a).length !== Object.keys(b).length) return false
  for (let key in a) if (a[key] !== b[key]) return false
  return true
}

export abstract class Color implements ColorType {
  abstract toFormat(format: ColorFormat): ColorType
  abstract toJSON(): Record<string, number>
  abstract toString(format: ColorStringFormat): string
  abstract clone(): ColorType
  abstract getChannelRange(channel: ColorChannel): ColorChannelRange
  abstract getFormat(): ColorFormat
  abstract getChannels(): [ColorChannel, ColorChannel, ColorChannel]
  abstract formatChannelValue(channel: ColorChannel, locale: string): string

  toHexInt(): number {
    return this.toFormat("rgba").toHexInt()
  }

  getChannelValue(channel: ColorChannel): number {
    // @ts-ignore
    if (channel in this) return this[channel]
    throw new Error("Unsupported color channel: " + channel)
  }

  getChannelValuePercent(channel: ColorChannel, valueToCheck?: number): number {
    const value = valueToCheck ?? this.getChannelValue(channel)
    const { minValue, maxValue } = this.getChannelRange(channel)
    return getValuePercent(value, minValue, maxValue)
  }

  getChannelPercentValue(channel: ColorChannel, percentToCheck: number): number {
    const { minValue, maxValue, step } = this.getChannelRange(channel)
    const percentValue = getPercentValue(percentToCheck, minValue, maxValue, step)
    return snapValueToStep(percentValue, minValue, maxValue, step)
  }

  withChannelValue(channel: ColorChannel, value: number): ColorType {
    const { minValue, maxValue } = this.getChannelRange(channel)
    if (channel in this) {
      let clone = this.clone()
      // @ts-ignore
      clone[channel] = clampValue(value, minValue, maxValue)
      return clone
    }

    throw new Error("Unsupported color channel: " + channel)
  }

  getColorAxes(xyChannels: Color2DAxes): ColorAxes {
    let { xChannel, yChannel } = xyChannels
    let xCh = xChannel || this.getChannels().find((c) => c !== yChannel)
    let yCh = yChannel || this.getChannels().find((c) => c !== xCh)
    let zCh = this.getChannels().find((c) => c !== xCh && c !== yCh)
    return { xChannel: xCh!, yChannel: yCh!, zChannel: zCh! }
  }

  incrementChannel(channel: ColorChannel, stepSize: number): ColorType {
    const { minValue, maxValue, step } = this.getChannelRange(channel)
    const value = snapValueToStep(
      clampValue(this.getChannelValue(channel) + stepSize, minValue, maxValue),
      minValue,
      maxValue,
      step,
    )
    return this.withChannelValue(channel, value)
  }

  decrementChannel(channel: ColorChannel, stepSize: number): ColorType {
    return this.incrementChannel(channel, -stepSize)
  }

  isEqual(color: ColorType): boolean {
    const isSame = isEqualObject(this.toJSON(), color.toJSON())
    return isSame && this.getChannelValue("alpha") === color.getChannelValue("alpha")
  }
}
