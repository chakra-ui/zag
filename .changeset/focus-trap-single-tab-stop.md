---
"@zag-js/dom-query": patch
"@zag-js/focus-trap": patch
---

- Fix focus trapping when the content has a single effective tab stop, such as a native radio group.
- Handle disconnected `initialFocus` nodes more safely.
