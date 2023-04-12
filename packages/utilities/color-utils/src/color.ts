import { ColorAxes, ColorChannel, ColorChannelRange, ColorFormat, Color as IColor } from "@react-types/color"

export abstract class Color implements IColor {
  abstract toFormat(format: ColorFormat): IColor
  abstract toString(format: ColorFormat | "css"): string
  abstract clone(): IColor
  abstract getChannelRange(channel: ColorChannel): ColorChannelRange
  abstract formatChannelValue(channel: ColorChannel, locale: string): string

  toHexInt(): number {
    return this.toFormat("rgb").toHexInt()
  }

  getChannelValue(channel: ColorChannel): number {
    if (channel in this) {
      return this[channel]
    }

    throw new Error("Unsupported color channel: " + channel)
  }

  withChannelValue(channel: ColorChannel, value: number): IColor {
    if (channel in this) {
      let x = this.clone()
      x[channel] = value
      return x
    }

    throw new Error("Unsupported color channel: " + channel)
  }

  getChannelName(channel: ColorChannel, locale: string) {
    return strings.getStringForLocale(channel, locale)
  }

  abstract getColorSpace(): ColorFormat

  getColorSpaceAxes(xyChannels: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes {
    let { xChannel, yChannel } = xyChannels
    let xCh = xChannel || this.getColorChannels().find((c) => c !== yChannel)
    let yCh = yChannel || this.getColorChannels().find((c) => c !== xCh)
    let zCh = this.getColorChannels().find((c) => c !== xCh && c !== yCh)

    return { xChannel: xCh, yChannel: yCh, zChannel: zCh }
  }
  abstract getColorChannels(): [ColorChannel, ColorChannel, ColorChannel]
}
