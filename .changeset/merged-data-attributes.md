---
"@zag-js/anatomy": major
"@zag-js/types": major
---

**Breaking:** Replace `data-scope`/`data-part`/`data-ownedby` with a single merged attribute
`data-{scope}-{part}="{uid}"`.

### Before

```html
<button data-scope="dialog" data-part="trigger" data-ownedby="dialog:1">Open</button>
<div data-scope="dialog" data-part="content" data-ownedby="dialog:1">...</div>
```

```css
[data-scope="dialog"][data-part="trigger"] { ... }
```

### After

```html
<button data-dialog-trigger="dialog:1">Open</button>
<div data-dialog-content="dialog:1">...</div>
```

```css
[data-dialog-trigger] { ... }
```

### Motivation

- **Seamless composition** - an element can participate in multiple machines via separate attributes (e.g.
  `data-popover-trigger` + `data-tooltip-trigger` on the same button)
- **Simpler selectors** - `[data-dialog-trigger]` instead of `[data-scope="dialog"][data-part="trigger"]`
- **Fewer attributes** - 1 attribute instead of 2-3 per element
- **Built-in instance scoping** - the uid value replaces `data-ownedby`/`data-uid`

### Migration

**CSS selectors:** Replace `[data-scope="X"][data-part="Y"]` with `[data-X-Y]`.

```diff
- [data-scope="dialog"][data-part="trigger"] { ... }
+ [data-dialog-trigger] { ... }

- [data-scope="slider"][data-part="thumb"][data-focus] { ... }
+ [data-slider-thumb][data-focus] { ... }
```

**JavaScript selectors:** Replace `[data-part="X"]` or `[data-scope="X"][data-part="Y"]` queries with `[data-X-Y]`.

```diff
- document.querySelector('[data-scope="dialog"][data-part="content"]')
+ document.querySelector('[data-dialog-content]')
```

**Anatomy API:** `parts.X.attrs` changed from an object to a function that takes a uid.

```diff
- ...parts.trigger.attrs
- "data-ownedby": scope.id,
+ ...parts.trigger.attrs(scope.id)
```

Each anatomy part now also exposes an `attr` property with the attribute name string (e.g. `"data-dialog-trigger"`).

**Removed from types:** `data-scope`, `data-part`, `data-ownedby`, and `data-uid` are no longer in `DataAttr`.
