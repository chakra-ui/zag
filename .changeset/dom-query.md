---
"@zag-js/dom-query": minor
---

- Add `getModifierKeys` and `hasModifierKey`.
- Fix typeahead not matching items that start with an accented or non-Latin character, and match regardless of case and
  accents (typing "e" finds "Éditer").
- Fix the shared resize observers throwing when `ResizeObserver` is unavailable, such as in jsdom.
