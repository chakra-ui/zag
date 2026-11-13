---
"@zag-js/tags-input": minor
---

- Add `api.highlightedValue` with the highlighted tag's value.

- Add `values` to the `onValueInvalid` details with the tags that failed `validate`.

- Fix `onHighlightChange` reporting the tag's DOM id instead of its value.

- Fix pasting with `addOnPaste` skipping the checks a typed tag goes through. Each pasted tag is validated, empty
  segments are skipped, and the paste stops at `max` unless `allowOverflow` is set.

- Keep the pasted text in the input when none of its tags can be added.

- Fix a disabled `<fieldset>` not disabling the tags input.
