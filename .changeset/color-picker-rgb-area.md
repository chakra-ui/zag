---
"@zag-js/color-picker": patch
---

Fix `Unknown color channel: hue` thrown by the channel slider track whenever the picker holds an RGB color, which a hex
`defaultValue` produces.

`getAreaFormat` kept rgb formats in `rgba` while every other format resolved to `hsba`, so the color area and its
sliders ran on an `RGBColor` that has no hue channel. The area is a saturation/brightness square, so it now resolves to
`hsba` like the rest. `getSliderBackground` also read the channel range before the switch, including for `hue`, which
returns a fixed gradient and never uses it.
