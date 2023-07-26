import { adjustHue, darken, desaturate, toHex } from "color2k"

export function createGradient(accentColor: string) {
  const startColor = toHex(darken(desaturate(adjustHue(accentColor, 9), 0.52), 0.1))
  const stopColor = toHex(darken(desaturate(adjustHue(accentColor, 9), 0.43), 0.22))
  return {
    startColor,
    stopColor,
    value: `linear-gradient(112deg, ${startColor} 0%, ${stopColor} 100%)`,
  }
}
