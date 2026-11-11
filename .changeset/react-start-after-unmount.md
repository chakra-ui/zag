---
"@zag-js/react": patch
---

- Fix machines starting after their component unmounts in the same tick, which left a dialog's scroll lock on
  `document.body` (#3631).
