---
"@zag-js/cascade-select": patch
---

- Fix the content taking focus after closing right after it opened.
- Fix leaving an item clearing the next item's grace area early, which could switch the highlighted item.
- Fix a pending scroll to the highlighted item running after the content closes.
- Fix the trigger missing its focus ring in Firefox after closing with Escape.
- Fix Escape not closing the content right after it opens.
