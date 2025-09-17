---
"@zag-js/number-input": patch
---

When `formatOptions` is used (like `style: "currency"`), the cursor would jump to the end of the input when typing in
the middle. The cursor now maintains its relative position during formatting changes.
