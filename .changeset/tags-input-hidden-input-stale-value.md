---
"@zag-js/tags-input": patch
---

Fix native form submit so `FormData` reflects the current tags, not the mount-time value (#3193).

After adding, removing, or clearing tags, the hidden input kept its initial value — e.g. with `defaultValue={["a"]}`,
adding `"b"` and submitting sent `"a"` instead of `"a, b"`. The hidden input now stays in sync on every value change.
