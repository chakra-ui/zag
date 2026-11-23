---
"@zag-js/utils": patch
"@zag-js/color-picker": patch
---

- Fix `rgb()` percentage channels and alpha being parsed as `0`.
- Fix hex output containing decimals when RGB channels are fractional.
- Fix invalid `rgb()`, `hsl()` and `hsb()` values being parsed instead of rejected.
- Add support for the space-separated syntax, e.g. `rgb(255 0 0 / 50%)` and `hsl(120deg 50% 50%)`.
