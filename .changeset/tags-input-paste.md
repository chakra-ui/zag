---
"@zag-js/tags-input": minor
---

- Fix pasting with `addOnPaste` skipping the checks a typed tag goes through. Each pasted tag is validated on its own,
  empty segments are skipped, and the paste stops at `max` unless `allowOverflow` is set.
- Keep the pasted text in the input when none of its tags can be added.
- Add `values` to the `onValueInvalid` details with the tags that failed `validate`. A paste reports them in one call.
