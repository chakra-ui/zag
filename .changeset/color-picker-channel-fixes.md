---
"@zag-js/color-picker": patch
---

- Fix arrow, page, Home, and End keys on a channel slider throwing when the format doesn't have that channel, like hue
  in `rgba`.

- Fix `PageUp` and `PageDown` on a channel slider resetting the value instead of stepping it.

- Fix vertical channel sliders running top to bottom while their gradient runs bottom to top.

- Fix `getChannelValueText` throwing for a channel the format doesn't have.

- Fix a typed color being stored in its own format instead of the picker's.

- Keep the hue when the color reaches gray, and update the area and sliders when the value changes from outside.

- Fix `onValueChangeEnd` not firing for keyboard changes on the area and channel sliders, or for swatch clicks.

- Fix the format select ignoring `defaultFormat`, and showing the first option on mount in Vue.

- Fix number channel inputs showing spinners in Firefox when server-rendered with Vue.

- Fix `PageUp` and `PageDown` on the area moving the x channel. They now step the y channel, and `Home` and `End` step
  the x channel.

- Add `aria-invalid` to the channel inputs, area thumb, and channel slider thumbs.

- Add readable labels and value text to the area and channel slider thumbs, like "Hue" and "210°".

- Add `aria-pressed` to swatch triggers.

- Add arrow-key stepping to number channel inputs, applied as you press.
