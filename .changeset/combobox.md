---
"@zag-js/combobox": minor
---

- Announce the result count to screen readers after typing, or "No results" when nothing matches.
- Add a `loading` prop that sets `aria-busy` on the listbox and holds back "No results" while loading.
- Add `resultsCount`, `noResults` and `loading` translations. Set one to `""` to turn that announcement off.
- Add `modifiers` to the `navigate` and `onSelect` details.
- Fix Cmd/Ctrl/Shift/Alt+Enter on link items not opening the link like a modifier-click.
- Call `onSelect` when a link item is modifier-clicked. Skip navigating in `onSelect` while a modifier is held.
- Fix announcements not working in modal dialogs.
- Fix unselected options missing `aria-selected="false"`.
- Fix `inputBehavior: "autohighlight"` leaving nothing highlighted when the highlighted item is removed.
- Scroll the list back to the top when the input changes while open.
- Fix focus being pulled back into the input when tabbing away right after selecting an item.
- Fix an item staying highlighted after the combobox closes right after opening with the keyboard.
- Fix Escape not closing the content right after it opens.
