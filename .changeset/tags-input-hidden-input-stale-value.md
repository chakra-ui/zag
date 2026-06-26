---
"@zag-js/tags-input": patch
---

Fix native form submit so `FormData` reflects the current tags (#3193).

The hidden input kept its initial value after tags were added, removed, or cleared. With `defaultValue={["a"]}`, adding `"b"` and submitting sent `"a"` instead of `"a, b"`.
