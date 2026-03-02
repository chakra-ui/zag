---
"@zag-js/i18n-utils": patch
---

`formatTime` now accepts `amLabel` and `pmLabel` as separate options instead of the previous `amPmLabels` object.

This is a breaking API change for consumers using the old option shape. It also allows overriding AM and PM labels independently.
