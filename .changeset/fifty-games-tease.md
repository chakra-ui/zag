---
"@zag-js/color-picker": patch
"@zag-js/range-slider": patch
"@zag-js/radio-group": patch
"@zag-js/dom-query": patch
"@zag-js/carousel": patch
"@zag-js/checkbox": patch
"@zag-js/splitter": patch
"@zag-js/slider": patch
"@zag-js/switch": patch
---

- Refactor machines to avoid the use of `dom.queryById`, this causes the machine to throw in React when the `key` of an
  element is reassigned.

- Remove `queryById` from the `createScope` function.
