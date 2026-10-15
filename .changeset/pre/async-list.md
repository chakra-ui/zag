---
"@zag-js/async-list": major
---

**Breaking:** Filter and sorting state are now generic, and several names changed.

```diff
- asyncList.Machine<Item, Cursor>
+ asyncList.Machine<Item, Filter, Sorting, Cursor>

- async load({ signal, cursor, filterText, sortDescriptor })
+ async load({ signal, cursor, filter, sorting })

- sort({ items, descriptor, filterText })
+ sort({ items, sorting, filter })
```

| Before                      | After                           |
| --------------------------- | ------------------------------- |
| `initialFilterText`         | `initialFilter`                 |
| `initialSortDescriptor`     | `initialSorting`                |
| `api.setFilterText()`       | `api.setFilter()`               |
| `api.sort()`                | `api.setSorting()`              |
| `api.filterText`            | `api.filter`                    |
| `api.sortDescriptor`        | `api.sorting`                   |
| `api.sorting` (boolean)     | `api.isSorting`                 |
| `api.loading` / `api.empty` | `api.isLoading` / `api.isEmpty` |

### New

- `keepPreviousItems` keeps the current items visible while a new filter or sort loads.
- `api.isLoadingMore` tells pagination loads apart from full reloads.
- `setFilter` and `setSorting` accept an updater function, e.g.
  `api.setFilter((prev) => ({ ...prev, status: "active" }))`.
- `load` receives the current `items`, for custom merging. `api.error` is typed as `Error`.

### Fixes

- `loadMore` requests are no longer treated as initial loads.
