---
"@zag-js/combobox": minor
---

- Announce the result count to screen readers after typing, or "No results" when nothing matches.
- Add a `loading` prop that sets `aria-busy` on the listbox and holds back "No results" while results load.
- Add `resultsCount`, `noResults` and `loading` translations. Set one to an empty string to turn that announcement off.
- Add the live regions inside the root element, so announcements work in modal dialogs.
