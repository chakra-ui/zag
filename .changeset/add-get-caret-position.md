---
"@zag-js/dom-query": patch
---

Add `getCaretPosition`, which measures the caret position in an input or textarea, returning `{ left, top, height }`
relative to the element's bounding client rect. Useful for anchoring a popup (e.g. a mention menu) to the caret.
