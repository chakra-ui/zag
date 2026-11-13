---
"@zag-js/avatar": patch
---

- Fix the status staying "loaded" when the image remounts with a new `src`, which left the avatar blank.

- Fix the fallback not showing when an image wrapped in another element, such as `<picture>`, is removed.
