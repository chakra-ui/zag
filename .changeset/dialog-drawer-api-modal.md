---
"@zag-js/dialog": patch
"@zag-js/drawer": patch
---

Add `api.modal` to read whether the dialog or drawer is modal. Useful for skipping the backdrop in non-modal mode.

```tsx
{api.modal && <div {...api.getBackdropProps()} />}
```
