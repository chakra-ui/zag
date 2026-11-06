---
"@zag-js/preact": major
---

- Require Preact 11 and stop depending on `preact/compat`, so apps without compat no longer bundle it.
- Keep `send`, `prop`, `context`, `computed`, `refs` and `getStatus` referentially stable across renders, so they're
  safe in effect dependencies.
- Compare bindable values with `Object.is` by default, matching the other adapters.
- Type prop getters with Preact's HTML attributes, without signals, so they spread onto any element.
- Fix characters getting dropped when typing fast into an input whose value a machine syncs, such as combobox or
  tags-input.
