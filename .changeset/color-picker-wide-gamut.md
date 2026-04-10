---
"@zag-js/color-utils": minor
"@zag-js/color-picker": minor
---

Add OKLab and OKLCH as color formats with `in oklab` / `in oklch` area and slider gradients, plus an optional sRGB gamut overlay for wide-gamut picking.

**Color picker API:** Use `getGamutOverlay(props?)` (replaces the removed `gamutOverlay` property) with the same props as `getAreaProps` / `getGamutOverlayProps`. Adds `isInSrgbGamut` and optional `pixelRatio` on overlay props for DPR-aware boundary sampling. See [OSS-2393](https://linear.app/chakra/issue/OSS-2393/color-picker-wide-gamut-color-support-oklaboklch-srgb-gamut-overlay).
