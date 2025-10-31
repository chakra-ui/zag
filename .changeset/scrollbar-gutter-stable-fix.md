---
"@zag-js/remove-scroll": patch
---

Fix issue where setting `scrollbar-gutter: stable` in CSS caused an unwanted gap and layout shift when opening dialogs. Zag now detects when the browser is already reserving space for the scrollbar and skips adding extra padding.

Fixes #2807
