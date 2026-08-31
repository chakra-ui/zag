---
"@zag-js/gridlist": minor
---

Add `@zag-js/gridlist` — a framework-agnostic state machine for the WAI-ARIA grid pattern. Use this for interactive
lists whose items contain buttons, links, or other focusable content where listbox's `option` role isn't valid.

Features:

- Single/multiple selection with `toggle` or `replace` behavior
- Full keyboard navigation: arrows, Home/End, Page Up/Down, typeahead, Ctrl/Cmd+A
- Item activation via `onAction`
- Linkable items via `href` + `onNavigate`
- Checkbox helper for toggle selection
- Grouping via `collection.group()`
- Virtualization via `scrollToIndexFn`
- 2D layouts via `GridCollection`

Parts: `root`, `label`, `content`, `itemGroup`, `itemGroupLabel`, `item`, `cell`, `itemText`, `itemIndicator`,
`checkbox`, `empty`.
