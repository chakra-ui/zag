# Upgrading from v1

Most models learned Zag v1, so v1 code is the most common mistake in a v2 project. Check this list when the project has
`@zag-js/*` 2.x. The full guide is at `{docs}/guides/migration.md`.

## Start with the codemod

```bash
npx @zag-js/codemod@next v2 src
```

It rewrites selectors, renames props and api methods, and lists what it can't change with a file and line. Commit first:
it won't touch files with uncommitted changes. Add `--dry-run` to preview.

Update every `@zag-js/*` package to the same version. Solid needs `solid-js` 2, and Preact needs `preact` 11.

## v1 habits to avoid

| v1                                                            | v2                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `[data-scope="dialog"][data-part="content"]`                  | `[data-dialog-content]`                                               |
| `z-index` on the content                                      | `z-index: calc(1400 + var(--layer-index))` on the positioner          |
| `getPrevTriggerProps()`, `api.goToPrev()`, `selectPrev()`     | `getPreviousTriggerProps()`, `api.goToPrevious()`, `selectPrevious()` |
| Items directly inside the select, combobox or listbox content | Items inside `getListProps()`, which now has `role="listbox"`         |
| Combobox `name` on the input                                  | `name` on `getHiddenInputProps()`                                     |
| Combobox `disableLayer: true`                                 | `inline: true`                                                        |
| `composite: false` (combobox, menu, select)                   | `popupType: "dialog"`                                                 |
| `api.setHighlightValue(v)`                                    | `api.setHighlightedValue(v)`                                          |
| Toggle `[data-state="on"]`                                    | `[data-pressed]`                                                      |
| Tree view `getBranchProps()`, `getItemProps()`                | `getNodeGroupProps()`, `getNodeProps()`                               |
| `Portal` from `solid-js/web`                                  | `Portal` from `@solidjs/web`                                          |
| `<Index>` in Solid                                            | `<For keyed={false}>`                                                 |

When a name from memory doesn't typecheck, look it up in the migration guide's rename table before guessing another.
