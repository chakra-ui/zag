---
"@zag-js/signature-pad": patch
---

- Fix issue where hidden input throws a controlled warning in React due to the absence of `readOnly` or `onChange`
- Fix issue where calling `getDataUrl` in the `onDrawEnd` callback after clearing the signature pad does not return an
  empty string
