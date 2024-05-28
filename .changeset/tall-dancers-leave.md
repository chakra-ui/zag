---
"@zag-js/floating-panel": patch
"@zag-js/signature-pad": patch
"@zag-js/color-picker": patch
"@zag-js/number-input": patch
"@zag-js/rating-group": patch
"@zag-js/toggle-group": patch
"@zag-js/date-picker": patch
"@zag-js/file-upload": patch
"@zag-js/time-picker": patch
"@zag-js/tags-input": patch
"@zag-js/dom-event": patch
"@zag-js/dom-query": patch
"@zag-js/pin-input": patch
"@zag-js/tree-view": patch
"@zag-js/combobox": patch
"@zag-js/editable": patch
"@zag-js/select": patch
"@zag-js/slider": patch
"@zag-js/menu": patch
"@zag-js/tabs": patch
---

Fix issue where keydown event might not fire in React due to `nativeEvent` currentTarget not been set sometimes.
