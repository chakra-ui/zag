---
"@zag-js/utils": minor
"@zag-js/color-picker": patch
---

- Add CSS Color 4 parsing for `hwb()`, `lab()`, `lch()` and `color()`.
- Add `getContrastRatio`, `getColorDistance`, `mixColors` and `toGamut`.
- Add `getChannelColor`, `getChannelGradient`, `getChannelThumbColor` and `getSrgbGamutPath`.
- Fix `toString("rgb" | "hsl" | "hsb")` throwing for OKLab and OKLCH colors.
- Fix the saturation input's range throwing for OKLab and OKLCH colors.
- Use the exact CSS Color 4 Display P3 matrix for the sRGB gamut line.
- Remove the `OklabColor` and `OklchColor` classes and the OKLab math helpers. `Color` is now a type.
