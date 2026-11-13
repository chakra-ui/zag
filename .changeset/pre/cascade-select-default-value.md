---
"@zag-js/cascade-select": patch
---

Fix the selected and highlighted state getting out of sync with `value` and `highlightedValue`.

- The trigger now shows `valueAsString` for a `defaultValue`, a controlled `value`, and a controlled `value` changed
  from outside.
- When a controlled `value` rejects a selection, the trigger keeps showing the controlled value instead of the rejected
  one.
- A controlled `highlightedValue` now opens the matching nested lists.
- Opening the menu now scrolls every list to its part of the highlighted path, not only the last list.
