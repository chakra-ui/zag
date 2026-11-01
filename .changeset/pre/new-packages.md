---
"@zag-js/field": minor
"@zag-js/fieldset": minor
"@zag-js/meter": minor
"@zag-js/gridlist": minor
"@zag-js/infinite-scroll": minor
"@zag-js/number-flow": minor
---

New machines:

- **`@zag-js/field`:** Label, describe and validate a native input, textarea or select. Tracks `touched`, `dirty`,
  `filled` and `focused`, and validates with native `ValidityState` or your own `validate` (sync or async).
  `validationMode` sets when errors show: `onSubmit` (default), `onBlur` or `onChange`.
- **`@zag-js/fieldset`:** A native `<fieldset>` with a legend, helper text and error text. Disabling it disables the
  fields inside.
- **`@zag-js/meter`:** A value in a known range, with `low`, `high` and `optimum` regions exposed as `valueState`.
- **`@zag-js/gridlist`:** The WAI-ARIA grid pattern for lists whose items contain buttons, links or other focusable
  content. Supports single and multiple selection, full keyboard navigation, typeahead, links, grouping, virtualization
  and 2D layouts.
- **`@zag-js/infinite-scroll`:** Loads paginated content as the user scrolls, at either end (feeds or chat threads),
  horizontally or in RTL, with screen reader announcements.
- **`@zag-js/number-flow`:** Animates a number change by rolling each digit to its new value. Formats with
  `Intl.NumberFormat`, so currency, percent and non-Latin numerals work.
