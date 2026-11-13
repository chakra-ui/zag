---
"@zag-js/accordion": major
---

- Add `hiddenUntilFound`, so closed content stays searchable with the browser's find-in-page. A match opens the item. A
  `[hidden] { display: none }` reset blocks this, so exclude it:

  ```css
  [hidden]:not([hidden="until-found"]) {
    display: none;
  }
  ```

- **Breaking:** Remove arrow, `Home` and `End` navigation between triggers, and the `loopFocus` prop, following the
  WAI-ARIA accordion pattern. Triggers are reached with `Tab`. Remove `loopFocus` from your props.

- **Breaking:** Default `collapsible` to `true`. Set it to `false` to keep one item open.

  ```diff
  - accordion.machine({})
  + accordion.machine({ collapsible: false })
  ```
