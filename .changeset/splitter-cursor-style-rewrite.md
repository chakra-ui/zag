---
"@zag-js/splitter": patch
---

Fix slow dragging in large documents. The global cursor style was rewritten on every pointer move, forcing a
document-wide style recalculation each time. It is now only written when the cursor actually changes.
