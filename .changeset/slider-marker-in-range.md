---
"@zag-js/slider": minor
---

Added `inRange` to the marker state and `data-in-range` to markers within the filled range. It accounts for `origin` and
range sliders, unlike `data-state` which only compares against the thumb values.

```css
[data-slider-marker][data-in-range] {
  color: white;
}
```
