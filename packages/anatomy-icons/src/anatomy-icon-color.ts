import type { AnatomyIconProps } from "./types"
import { adjustHue, darken, desaturate, lighten, toHex } from "color2k"

export class AnatomyIconColor {
  public accentColor: string

  constructor(params: AnatomyIconProps) {
    this.accentColor = params.accentColor
  }

  getColorPalette() {
    const palette = {
      0: "#FFFFFF",
      1: this.accentColor,
      2: darken(desaturate(adjustHue(this.accentColor, 4), 0.53), 0.26),
      3: darken(desaturate(adjustHue(this.accentColor, 9), 0.51), 0.42),
      4: darken(desaturate(adjustHue(this.accentColor, 9), 0.53), 0.38),
      5: darken(desaturate(adjustHue(this.accentColor, 9), 0.5), 0.28),
      6: darken(desaturate(adjustHue(this.accentColor, 7), 0.36), 0.26),
      7: darken(desaturate(adjustHue(this.accentColor, 5), 0.38), 0.16),
      8: darken(desaturate(adjustHue(this.accentColor, 6), 0.44), 0.33),
      9: lighten(adjustHue(this.accentColor, 5), 0.29),
    }

    return Object.entries(palette).reduce((acc, [key, value]) => Object.assign(acc, { [key]: toHex(value) }), {})
  }
}
