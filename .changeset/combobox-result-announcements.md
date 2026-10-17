---
"@zag-js/combobox": minor
---

Announce the result count to screen readers when typing and add a `loading` prop for async results.

- After the input and results settle, the combobox announces "N results", "1 result", or "No results" through a polite
  live region, on all platforms.
- Pass `loading` while results are being fetched. The listbox gets `aria-busy` and `data-loading`, the loading message
  is announced instead of the count, and "No results" is held back until loading ends. `api.loading` exposes the value.
- Customize or disable the messages with the new `resultsCount`, `noResults`, and `loading` translations. An empty
  message turns that announcement off.
