---
"@zag-js/slider": minor
---

- Add `disabled` to `getThumbProps` and `getHiddenInputProps` to disable a single thumb. It can't be focused or moved,
  the track moves the closest enabled thumb instead, and other thumbs stop at it.
