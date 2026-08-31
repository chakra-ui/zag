---
"@zag-js/floating-panel": patch
"@zag-js/color-picker": patch
"@zag-js/dom-query": patch
"@zag-js/popover": patch
"@zag-js/preact": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/select": patch
"@zag-js/react": patch
---

- Fixed issue where `initialFocusEl` rejected `null`, despite it being handled at runtime. On `dialog` and `drawer` it
  was listed as a prop with a default, which stripped `null | undefined` from its public type.
- Fixed issue where `Portal`'s `container` rejected the `RefObject<T | null>` that React 19's `useRef<T>(null)` returns.
