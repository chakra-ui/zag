---
"@zag-js/cascade-select": patch
---

- Fix the content taking focus after closing right after it opened.
- Fix leaving one item clearing the next item's grace area early, which could switch the highlighted item.
- Fix a pending scroll to the highlighted item running after the content closes.
