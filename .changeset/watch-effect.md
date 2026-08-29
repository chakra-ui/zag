---
"@zag-js/core": minor
"@zag-js/react": minor
"@zag-js/preact": minor
"@zag-js/solid": minor
"@zag-js/svelte": minor
"@zag-js/vue": minor
"@zag-js/vanilla": minor
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
