---
"@zag-js/virtualizer": patch
---

Fixed issue where the virtualizer content spacer collapsed inside a flex-column scroll container. The spacer sizes the
scroll container, but as a flex item it shrank to fit and reduced the list to roughly one row. The style helpers now
emit `flexShrink: 0`.
