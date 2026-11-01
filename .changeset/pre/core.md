---
"@zag-js/core": minor
"@zag-js/react": minor
"@zag-js/preact": minor
"@zag-js/solid": minor
"@zag-js/svelte": minor
"@zag-js/vue": minor
"@zag-js/vanilla": minor
"@zag-js/select": patch
"@zag-js/popover": patch
"@zag-js/carousel": patch
"@zag-js/clipboard": patch
"@zag-js/date-input": patch
---

- Omitting a required prop is now a type error instead of a runtime `[zag-js] missing required props` error. Affects
  `async-list`, `carousel`, `dnd`, `gridlist`, `listbox`, `pin-input`, `select`, `splitter`, `toast` and `toc`.
- Props with a default keep `null` in their public type, so props that accept `null` no longer reject it.
- Custom machines: schemas can declare a `defaultPropKey` union naming the props the machine fills in. Schemas without
  it work unchanged.
- Custom machines: added `watchEffect` to effects, so an effect re-runs when its deps change without re-entering its
  state.

  ```ts
  effects: {
    trapFocus({ prop, watchEffect }) {
      return watchEffect([() => prop("trapFocus")], () => {
        if (prop("trapFocus")) return trapFocus(/* ... */)
      })
    },
  }
  ```

- Faster nested state transitions and `hasTag` checks.
- Removing a key from an object now updates memoized values and effects that depend on it.
- The date input no longer rebuilds its segments on every render when `translations` is passed inline.
