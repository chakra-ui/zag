---
"@zag-js/dom-query": patch
---

- Fix menu and tree view typeahead not matching items that start with an accented or non-Latin character.
- Typeahead now ignores case and accents, so typing "e" finds "Éditer".
