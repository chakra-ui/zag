---
"@zag-js/utils": minor
"@zag-js/color-picker": patch
---

- Rebuild the color module around one internal color type and a table of color spaces. It's smaller, with the same
  values, strings and gradients as before.
- Read every CSS Color 4 color: `hwb()`, `lab()`, `lch()` and `color()` (`srgb`, `srgb-linear`, `display-p3`, `xyz`,
  `xyz-d50`, `xyz-d65`). Wide-gamut colors keep their values in OKLab or OKLCH.
- Add `getContrastRatio` (WCAG 2), `getColorDistance` (ΔEOK), `mixColors` (like CSS `color-mix()`) and `toSrgbGamut`
  (CSS Color 4 gamut mapping). Each is its own import, so a bundle keeps only what it uses.
- Add `getChannelColor` and `getChannelGradient`, which the color picker now uses for its channel inputs and sliders.
- Fix `toString("rgb")`, `toString("hsl")` and `toString("hsb")` throwing for OKLab and OKLCH colors.
- Fix a channel input's range for saturation throwing for OKLab and OKLCH colors.
- Use the exact CSS Color 4 matrix for Display P3, which moves a few points of the color picker's sRGB boundary line.
- `Color` is now a type (the same as `ColorType`). Remove the `OklabColor` and `OklchColor` classes and the OKLab math
  helpers from the exports.
