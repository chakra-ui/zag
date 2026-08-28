---
"@zag-js/field": minor
---

Add `@zag-js/field`. Label, describe, and validate a native input, textarea, or select from one machine.

It tracks `touched`, `dirty`, `filled`, and `focused` from the control. Pass `dirty` or `touched` when a form library
already owns those flags.

Errors come from native `ValidityState` or your `validate` function (sync or async). `validationMode` chooses when they
show: `onSubmit` (default), `onBlur`, or `onChange`. An empty required field stays quiet until the user edits it or
submits.

A field with several controls sets `target` to the item the label and validity own, and passes `{ item }` on
`getInputProps` / `getSelectProps` for each sibling.
