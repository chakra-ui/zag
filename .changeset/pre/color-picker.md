---
"@zag-js/color-utils": minor
"@zag-js/color-picker": minor
---

- Added OKLab and OKLCH formats, with matching area and slider gradients and an optional sRGB gamut overlay.
- **Breaking:** `getGamutOverlay(props?)` replaces the `gamutOverlay` property. Pass it the same props as
  `getAreaProps`.
- Fixed issue where the channel slider track threw `Unknown color channel: hue` with an RGB color, such as one from a
  hex `defaultValue`.
- The area and channel slider thumbs set `aria-disabled` when `disabled` is set.
