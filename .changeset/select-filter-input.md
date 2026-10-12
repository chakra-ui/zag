---
"@zag-js/select": minor
---

Add `getInputProps()` and `getEmptyProps()` for filterable selects. Use them with `popupType: "dialog"`; the consumer
filters the collection.

- The input takes focus when the select opens and keeps it while the arrow keys move the highlight.
- Home and End jump to the first or last item when the input is empty, and Shift+Tab closes the select.
- `getEmptyProps()` marks up a "no results" message as a polite live region, so screen readers announce it.
- A dialog popup opens below the trigger instead of aligning its selected item with it.
- Fixed issue where `alignItemWithTrigger` placed the selected item of a long or wrapping list away from the trigger.
