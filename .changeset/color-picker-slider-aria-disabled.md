---
"@zag-js/color-picker": patch
---

Fix `aria-disabled` on the color area thumb and channel slider thumb so assistive technology reports both
`role="slider"` elements as disabled when `disabled` is set.
