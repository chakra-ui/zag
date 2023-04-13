export type ColorFormat = "hex" | "hexa" | "rgb" | "rgba" | "hsl" | "hsla" | "hsb" | "hsba"

export type ColorChannel = "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue" | "alpha"

export type ColorAxes = { xChannel: ColorChannel; yChannel: ColorChannel; zChannel: ColorChannel }

export interface ColorChannelRange {
  /** The minimum value of the color channel. */
  minValue: number
  /** The maximum value of the color channel. */
  maxValue: number
  /** The step value of the color channel, used when incrementing and decrementing. */
  step: number
  /** The page step value of the color channel, used when incrementing and decrementing. */
  pageSize: number
}

export interface ColorType {
  /** Converts the color to the given color format, and returns a new Color object. */
  toFormat(format: ColorFormat): ColorType
  /** Converts the color to a string in the given format. */
  toString(format: ColorFormat | "css"): string
  /** Converts the color to hex, and returns an integer representation. */
  toHexInt(): number
  /**
   * Returns the numeric value for a given channel.
   * Throws an error if the channel is unsupported in the current color format.
   */
  getChannelValue(channel: ColorChannel): number
  /**
   * Sets the numeric value for a given channel, and returns a new Color object.
   * Throws an error if the channel is unsupported in the current color format.
   */
  withChannelValue(channel: ColorChannel, value: number): ColorType
  /**
   * Returns the minimum, maximum, and step values for a given channel.
   */
  getChannelRange(channel: ColorChannel): ColorChannelRange
  /**
   * Returns the color space, 'rgb', 'hsb' or 'hsl', for the current color.
   */
  getColorSpace(): ColorFormat
  /**
   * Returns the color space axes, xChannel, yChannel, zChannel.
   */
  getColorSpaceAxes(xyChannels: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes
  /**
   * Returns an array of the color channels within the current color space space.
   */
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel]
  /**
   * Returns a new Color object with the same values as the current color.
   */
  clone(): ColorType
  /**
   * Whether the color is equal to another color.
   */
  isEqual(color: ColorType): boolean
}
