---
"@zag-js/clipboard": major
---

- Fix copying again while copied not restarting the `timeout`.

- Fix a failed copy showing as copied. `onStatusChange` reports `{ copied: false, error }` instead.

- Report `{ copied: false }` from `onStatusChange` when the `timeout` ends.

- **Breaking:** Remove the `execCommand` fallback. Copying needs the Clipboard API, which is only available on https
  pages and localhost.
