---
"@zag-js/fieldset": minor
---

- Remove `aria-invalid` from the root. The role doesn't support it; `data-invalid` is kept for styling.
- Remove `aria-live` from the error text.
- Only set `aria-labelledby` while a legend is rendered.
- Fix the disabled state not updating when a fieldset further up the tree is disabled.
