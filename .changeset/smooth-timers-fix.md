---
"@zag-js/timer": patch
---

- Fix issue wher timer could continue beyond `targetMs` when window is not visible
- Add validation to ensure `startMs` and `targetMs` are configured correctly
- Fix `progressPercent` calculation for countdown timers
