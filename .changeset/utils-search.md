---
"@zag-js/utils": major
"@zag-js/dom-query": minor
"@zag-js/collection": minor
---

- Move `@zag-js/fuzzy`, `@zag-js/highlight-word` and `createFilter` from `@zag-js/i18n-utils` to `@zag-js/utils/search`.
  The old packages are removed.
- Remove `createFuzzyMatcher` and `prepareFuzzyTarget`; use `createFuzzySearch` or `fuzzyScore`.
- Add `typeahead`, `createTypeaheadState` and `isTypeaheadKey`.
- Fix `highlightWord` highlighting the wrong characters after text that changes length when lowercased, like "İ".
- Highlight the first match of any term when `highlightWord` gets an array query with `matchAll: false`, instead of
  throwing.
- Fix list collection typeahead ignoring accents and jumping past the active item while typing more of its text.
