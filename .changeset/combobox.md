---
"@zag-js/combobox": minor
---

- Announce the result count to screen readers after typing, or "No results" when nothing matches.
- Add a `loading` prop that sets `aria-busy` on the listbox and holds back "No results" while results load.
- Add `resultsCount`, `noResults` and `loading` translations. Set one to an empty string to turn that announcement off.
- Add `modifiers` to the `navigate` and `onSelect` details.
- Fix Cmd/Ctrl/Shift/Alt+Enter on link items not opening the link like a modifier-click.
- Call `onSelect` when a link item is clicked with a modifier. Skip navigating in `onSelect` when one is held.
- Fix announcements not working in modal dialogs.
- Fix unselected options missing `aria-selected="false"`.
- Fix `inputBehavior: "autohighlight"` leaving no item highlighted when the highlighted item is removed after keyboard
  or pointer navigation.
- Scroll the list back to the top when the input changes while open.
- Fix focus being pulled back into the input when tabbing away right after selecting an item.
