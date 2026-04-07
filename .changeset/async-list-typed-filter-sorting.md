---
"@zag-js/async-list": major
---

**Breaking:** Filter and sorting state are now generic.

The machine accepts four type parameters `<T, C, F, S>` instead of two `<T, C>`, where `F` is the filter state type and
`S` is the sorting state type.

### Migration

**Type parameters** are now `<Item, Filter, Sorting, Cursor>` (previously `<Item, Cursor>`):

```diff
- asyncList.machine as asyncList.Machine<Item, string>
+ asyncList.machine as asyncList.Machine<Item, string, SortDescriptor<Item>, string>
```

**`load` function:**

```diff
- async load({ signal, cursor, filterText, sortDescriptor }) {
+ async load({ signal, cursor, filter, sorting }) {
```

**`sort` (client-side) function:**

```diff
- sort({ items, descriptor, filterText }) {
+ sort({ items, sorting, filter }) {
```

**Props:**

```diff
- initialFilterText: "search term"
+ initialFilter: "search term"

- initialSortDescriptor: { column: "name", direction: "ascending" }
+ initialSorting: { column: "name", direction: "ascending" }
```

**API methods:**

```diff
- api.setFilterText("search")
+ api.setFilter("search")

- api.sort({ column: "name", direction: "ascending" })
+ api.setSorting({ column: "name", direction: "ascending" })
```

**API properties:**

```diff
- api.filterText
+ api.filter

- api.sortDescriptor
+ api.sorting

- api.sorting  // boolean
+ api.isSorting

- api.loading
+ api.isLoading

- api.empty
+ api.isEmpty
```

`SortDescriptor<T>` and `SortDirection` are still exported as convenience types.

### New features

**`keepPreviousItems` prop** — Prevents content flash when filter or sort changes. Previous items stay visible while new
data loads.

```ts
useAsyncList({
  keepPreviousItems: true,
  async load({ filter, signal }) { ... }
})
```

**`isLoadingMore` boolean** — Distinguishes pagination loads from full reloads.

```ts
if (api.isLoading && api.items.length === 0) // skeleton — first load
if (api.isLoadingMore)                       // footer spinner — infinite scroll
if (api.isLoading && api.items.length > 0)   // subtle overlay — filter/sort change
```

**Updater functions for `setFilter` / `setSorting`** — Accept a value or an updater function, matching the `useState`
convention.

```ts
api.setFilter((prev) => ({ ...prev, status: "active" }))
api.setSorting((prev) => toggleColumn(prev, "name"))
```
