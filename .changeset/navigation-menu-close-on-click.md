---
"@zag-js/navigation-menu": patch
---

- Avoid focusing the trigger when hovering over it.
- Add `closeOnClick` prop to `getLinkProps` to control whether the navigation menu closes when a link is clicked.
  Defaults to `true` (current behavior).
- Separate `ContentProps` from `LinkProps` for `getContentProps` - previously it incorrectly used `LinkProps`.
