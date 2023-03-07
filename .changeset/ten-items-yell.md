---
"@zag-js/tags-input": minor
"@zag-js/combobox": minor
"@zag-js/editable": minor
"@zag-js/select": minor
---

Add `onInteractOutside` hook to context.

This can be used to prevent loosing focus when composing with other components.

Example usage:

```ts
{
  onInteractOutside(event) {
    // Prevent loosing focus when interacting with related popup
    if (popupElement.contains(event.target)) {
      event.preventDefault()
    }
  }
}
```
