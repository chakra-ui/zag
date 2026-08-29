---
"@zag-js/core": patch
"@zag-js/react": patch
"@zag-js/preact": patch
"@zag-js/solid": patch
"@zag-js/svelte": patch
"@zag-js/vue": patch
"@zag-js/vanilla": patch
---

Add `watchEffect(deps, setup)` to effect implementations, so an effect can re-run when the props or context it depends
on change, without re-entering the state that owns it. It mirrors `track` in `watch`, which runs an action rather than
an effect.

```ts
effects: {
  trapFocus({ prop, watchEffect }) {
    return watchEffect([() => prop("trapFocus")], () => {
      if (!prop("trapFocus")) return
      return trapFocus(/* ... */)
    })
  },
}
```

Only the declared effect restarts, sibling effects and entry actions are untouched, and anything outside the call runs
once. Deps must return a primitive, the same constraint `track` has, so use `context.hash()` for anything else. Unlike
Vue's similarly named API, they are explicit rather than auto-tracked.
