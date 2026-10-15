---
"@zag-js/avatar": major
---

- Added `api.status` (`loading`, `loaded` or `error`), and `onStatusChange` now emits `loading`.
- **Breaking:** Removed `api.setSrc`. Update `src` on the image you render instead; the machine reacts the same way.

  ```diff
  - api.setSrc(nextSrc)
  + setSrc(nextSrc) // your own state, passed to <img src={src} />
  ```

  `api.setLoaded()` and `api.setError()` are unchanged.
