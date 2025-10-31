---
"@zag-js/slider": patch
---

Fix issue where programmatic value changes do not trigger the `onValueChangeEnd` callback. This affects the following
API methods:

- `slider.setThumbValue(index, value)`
- `slider.setValue(value)`
- `slider.increment(index)`
- `slider.decrement(index)`
