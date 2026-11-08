---
"@zag-js/avatar": patch
---

- Fix the status staying "loaded" when the image is remounted and its `src` changes, which left the avatar blank while
  the new image loaded.

- Fix the fallback not showing when an image wrapped in another element, such as `<picture>`, is removed.
