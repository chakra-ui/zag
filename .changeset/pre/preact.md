---
"@zag-js/preact": major
---

- **Breaking:** Require Preact 11. The adapter no longer depends on `preact/compat`, so apps without compat no longer
  bundle it.

  ```sh
  npm install preact@^11
  ```

- Keep `send`, `prop`, `context`, `computed`, `refs` and `getStatus` stable across renders, so they're safe in effect
  dependencies.

- Compare bindable values with `Object.is` by default, like the other adapters.

- Type prop getters with Preact's HTML attributes, without signals, so they spread onto any element.

- Fix characters getting dropped when typing fast into an input whose value a machine syncs, such as combobox or
  tags-input.

- Fix a machine reading a stale value when several events arrive before the next render.

- Fix a duplicate, unpositioned popup after hydration. `Portal` renders nothing on the server and mounts right after
  hydration.
