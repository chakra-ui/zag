---
"@zag-js/anatomy": major
---

**Breaking:** Replaced `data-scope`, `data-part` and `data-ownedby` with a single `data-{scope}-{part}` attribute. An
element can now belong to several machines, e.g. `data-popover-trigger` and `data-tooltip-trigger` on one button.

```html
<!-- Before -->
<button data-scope="dialog" data-part="trigger" data-ownedby="dialog:1">Open</button>
<!-- After -->
<button data-dialog-trigger="dialog:1">Open</button>
```

### Migration

Replace `[data-scope="X"][data-part="Y"]` with `[data-X-Y]` in CSS and JavaScript selectors:

```diff
- [data-scope="slider"][data-part="thumb"][data-focus] { ... }
+ [data-slider-thumb][data-focus] { ... }
```

Custom anatomies: `parts.X.attrs` is now a function that takes the uid, and each part exposes its attribute name as
`attr`.

```diff
- ...parts.trigger.attrs
- "data-ownedby": scope.id,
+ ...parts.trigger.attrs(scope.id)
```
