---
"@zag-js/slider": patch
---

- Fixed issue where `origin: "center"` assumed the neutral value was always the midpoint of `min`/`max`
- `origin` now also accepts a `number`, so the track can fill from that specific value instead
