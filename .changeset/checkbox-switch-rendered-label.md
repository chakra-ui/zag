---
"@zag-js/checkbox": patch
"@zag-js/switch": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/popover": patch
"@zag-js/dom-query": patch
---

- Fix the hidden input's `aria-labelledby` in checkbox and switch pointing to a missing element when the label part isn't rendered.
- Fix the content's `aria-labelledby` and `aria-describedby` in dialog, drawer and popover not updating when the title or description is added or removed while open.
- Add `trackRenderedParts` to track which parts are in the DOM.
