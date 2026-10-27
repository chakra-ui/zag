---
"@zag-js/solid": major
---

Move the Solid adapter to Solid 2.0 (`solid-js` and `@solidjs/web` 2.x).

- Effects use Solid 2's split `createEffect(compute, apply)`, the machine starts in `onSettled`, and state helpers are
  composed with `merge`.
- Writes apply when Solid flushes, so bindable values keep the latest write for reads in the same tick. `flush(fn)`
  also flushes Solid, so the DOM reflects `fn` before the next line runs.
- `Key` is now implemented with `<For keyed>` instead of `@solid-primitives/keyed`, with the same props.
