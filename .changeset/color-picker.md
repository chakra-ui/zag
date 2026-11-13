---
"@zag-js/color-picker": minor
---

- Add a `locale` prop for formatting the channel values announced on the area and sliders.

- Add readable labels and value text to the area and channel slider thumbs, like "Hue" and "210°".

- Add `aria-invalid` to the channel inputs and thumbs, and `aria-pressed` to swatch triggers.

- Add arrow-key stepping to number channel inputs.

- Fix keys on a channel slider throwing when the format doesn't have that channel, like hue in `rgba`, and
  `getChannelValueText` throwing for such a channel.

- Fix `PageUp` and `PageDown` resetting a channel slider instead of stepping it, and moving the area's x channel instead
  of y. `Home` and `End` step the area's x channel.

- Fix vertical channel sliders running opposite to their gradient.

- Fix a typed color being stored in its own format instead of the picker's.

- Fix the hue resetting when the color reaches gray, and the area and sliders not updating when the value changes from
  outside.

- Fix `onValueChangeEnd` not firing for keyboard changes or swatch clicks.

- Fix the format select ignoring `defaultFormat`.

- Fix number channel inputs showing spinners in Firefox when server-rendered with Vue.
