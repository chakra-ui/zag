---
"@zag-js/tabs": major
"@zag-js/radio-group": major
---

- Remove the inline transition styles from the indicator. Add the transition in your CSS.
- Add `data-instant` to the indicator when it moves for a reason other than a value change (first render, resize, `dir`
  or `orientation` change), so it can snap into place.
- Remove the `--transition-property`, `--transition-duration` and `--transition-timing-function` CSS variables.
- Replace `data-ssr` with `data-indicator-pending` on tab triggers and radio items. It's present during server rendering
  and also while the indicator hasn't been measured, such as inside a hidden panel.
- Fix the indicator animating on resize after a transition never finished.

**Migration**

Move the indicator transition into your CSS, and turn it off for `data-instant`:

```diff
  [data-tabs-indicator] {
-   --transition-duration: 0.2s;
-   --transition-timing-function: ease-in-out;
+   transition:
+     left 0.2s ease-in-out,
+     width 0.2s ease-in-out;
  }
+
+ [data-tabs-indicator][data-instant] {
+   transition: none;
+ }
```

Rename `data-ssr` in the styles that paint the selected item before the indicator is in place:

```diff
- [data-tabs-trigger][data-selected][data-ssr] { ... }
+ [data-tabs-trigger][data-selected][data-indicator-pending] { ... }

- [data-radio-group-item][data-state="checked"][data-ssr] { ... }
+ [data-radio-group-item][data-state="checked"][data-indicator-pending] { ... }
```
