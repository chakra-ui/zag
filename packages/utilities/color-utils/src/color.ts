import type { ColorType, ColorFormat, ColorChannel, ColorChannelRange, ColorAxes } from "./types"

export abstract class Color implements ColorType {
  abstract toFormat(format: ColorFormat): ColorType
  abstract toString(format: ColorFormat | "css"): string
  abstract clone(): ColorType
  abstract getChannelRange(channel: ColorChannel): ColorChannelRange
  abstract getColorSpace(): ColorFormat
  abstract getColorChannels(): [ColorChannel, ColorChannel, ColorChannel]

  toHexInt(): number {
    return this.toFormat("rgb").toHexInt()
  }

  getChannelValue(channel: ColorChannel): number {
    if (channel in this) {
      return this[channel]
    }

    throw new Error("Unsupported color channel: " + channel)
  }

  withChannelValue(channel: ColorChannel, value: number): ColorType {
    if (channel in this) {
      let clone = this.clone()
      clone[channel] = value
      return clone
    }

    throw new Error("Unsupported color channel: " + channel)
  }

  getColorSpaceAxes(xyChannels: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes {
    let { xChannel, yChannel } = xyChannels
    let xCh = xChannel || this.getColorChannels().find((c) => c !== yChannel)
    let yCh = yChannel || this.getColorChannels().find((c) => c !== xCh)
    let zCh = this.getColorChannels().find((c) => c !== xCh && c !== yCh)
    return { xChannel: xCh!, yChannel: yCh!, zChannel: zCh! }
  }

  isEqual(color: ColorType): boolean {
    return this.toHexInt() === color.toHexInt() && this.getChannelValue("alpha") === color.getChannelValue("alpha")
  }
}
