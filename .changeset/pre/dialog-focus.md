---
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/popover": patch
"@zag-js/floating-panel": patch
"@zag-js/color-picker": patch
"@zag-js/preact": patch
"@zag-js/select": patch
"@zag-js/react": patch
---

- `trapFocus`, `preventScroll` and `modal` now update while the dialog or drawer is open, and `modal` while the popover
  is open. Previously they needed a remount, which isn't possible for content like media playback.
- Releasing the focus trap no longer moves focus back to the trigger. Focus is restored only on close.
- `initialFocusEl` now accepts `null`.
- `Portal`'s `container` now accepts the `RefObject<T | null>` returned by React 19's `useRef<T>(null)`.
