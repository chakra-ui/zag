---
"@zag-js/dialog": patch
---

- Fix issue where interact outside handlers are not exposed
- Fix issue where interacting with toast closes dialog

> Breaking Changes

- Rename `closeOnEsc` to `closeOnEscapeKeyDown`
- Rename `onEsc` to `onEscapeKeyDown`
- Rename `closeOnOutsideClick` to `closeOnInteractOutside`
