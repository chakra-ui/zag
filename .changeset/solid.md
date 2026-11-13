---
"@zag-js/solid": major
---

- **Breaking:** Move the adapter to Solid 2. Upgrade `solid-js` and add `@solidjs/web`.

  ```sh
  npm install solid-js@^2.0.0-rc.19 @solidjs/web@^2.0.0-rc.19
  ```

- Fix nested menus not opening on hover or with the keyboard. `mergeProps` keeps keys a source adds after the first
  render.

- Fix `undefined` props from `mergeProps` overriding a machine's defaults.
