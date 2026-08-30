---
"@zag-js/dom-query": patch
---

Forward arguments from the cleanup `whenNode` returns to the cleanup `fn` returned, so callers can pass teardown intent
through. Existing calls are unchanged.
