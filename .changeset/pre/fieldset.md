---
"@zag-js/fieldset": minor
---

- Remove `aria-invalid` from the root, which its role doesn't support. `data-invalid` stays for styling.

- Remove `aria-live` from the error text.

- Only set `aria-labelledby` while a legend is rendered.

- Fix controls not picking up the disabled state from a fieldset further up the tree.
