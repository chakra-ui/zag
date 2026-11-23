---
"@zag-js/utils": major
"@zag-js/file-upload": patch
---

- Move `@zag-js/i18n-utils` to `@zag-js/utils/i18n`. The old package is removed.
- Fix `formatDate`: `G` returned the whole date, `h` and `hh` included the day period, `H` was zero-padded, `mm` and
  `ss` weren't, and `z` threw in 24-hour locales.
- Fix `formatDate` replacing text inside values it had already formatted.
- Fix `isRTL` throwing on an invalid locale tag.
