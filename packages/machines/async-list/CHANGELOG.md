# @zag-js/async-list

## 2.0.0-next.0

### Major Changes

- [#3061](https://github.com/chakra-ui/zag/pull/3061)
  [`56c75b2`](https://github.com/chakra-ui/zag/commit/56c75b21f9d8f7a4cd7bfa9ab5773f07f01c8024) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - **Breaking:** Filter and sorting state are now generic.

  The machine accepts four type parameters `<T, C, F, S>` instead of two `<T, C>`, where `F` is the filter state type
  and `S` is the sorting state type.

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

  **`keepPreviousItems` prop** — Prevents content flash when filter or sort changes. Previous items stay visible while
  new data loads.

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

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0

## 1.39.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.39.1
  - @zag-js/utils@1.39.1

## 1.39.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.39.0
  - @zag-js/utils@1.39.0

## 1.38.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.38.2
  - @zag-js/utils@1.38.2

## 1.38.1

### Patch Changes

- Updated dependencies [[`2b4818c`](https://github.com/chakra-ui/zag/commit/2b4818c3b82ed1ca8ffd2cb44110a4a195ac68d6)]:
  - @zag-js/core@1.38.1
  - @zag-js/utils@1.38.1

## 1.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.38.0
  - @zag-js/utils@1.38.0

## 1.37.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.37.0
  - @zag-js/utils@1.37.0

## 1.36.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.36.0
  - @zag-js/utils@1.36.0

## 1.35.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.35.3
  - @zag-js/utils@1.35.3

## 1.35.2

### Patch Changes

- Updated dependencies [[`01840ee`](https://github.com/chakra-ui/zag/commit/01840ee6f9672bedc784a2c434b84e8741e2dc25)]:
  - @zag-js/utils@1.35.2
  - @zag-js/core@1.35.2

## 1.35.1

### Patch Changes

- Updated dependencies [[`2ab725f`](https://github.com/chakra-ui/zag/commit/2ab725f6cb4631dc8d790a3da53f8fb7713e7ec1)]:
  - @zag-js/core@1.35.1
  - @zag-js/utils@1.35.1

## 1.35.0

### Patch Changes

- Updated dependencies [[`b0149ce`](https://github.com/chakra-ui/zag/commit/b0149cea73d2d975d0920d1a69561b6a85c9baa0)]:
  - @zag-js/core@1.35.0
  - @zag-js/utils@1.35.0

## 1.34.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.34.1
  - @zag-js/utils@1.34.1

## 1.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.34.0
  - @zag-js/utils@1.34.0

## 1.33.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.33.1
  - @zag-js/utils@1.33.1

## 1.33.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.33.0
  - @zag-js/utils@1.33.0

## 1.32.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.32.0
  - @zag-js/utils@1.32.0

## 1.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.31.1
  - @zag-js/utils@1.31.1

## 1.31.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.31.0
  - @zag-js/utils@1.31.0

## 1.30.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.30.0
  - @zag-js/utils@1.30.0

## 1.29.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.29.1
  - @zag-js/utils@1.29.1

## 1.29.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.29.0
  - @zag-js/utils@1.29.0

## 1.28.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.28.0
  - @zag-js/utils@1.28.0

## 1.27.1

### Patch Changes

- [#2822](https://github.com/chakra-ui/zag/pull/2822)
  [`a372b95`](https://github.com/chakra-ui/zag/commit/a372b955911f78632665c7df86365414f64ac1f0) Thanks
  [@nelsonlaidev](https://github.com/nelsonlaidev)! - Export missing types

- Updated dependencies []:
  - @zag-js/core@1.27.1
  - @zag-js/utils@1.27.1

## 1.27.0

### Patch Changes

- Updated dependencies [[`920e727`](https://github.com/chakra-ui/zag/commit/920e727f73940aed3c6d2b886c64200a4a5702d0)]:
  - @zag-js/utils@1.27.0
  - @zag-js/core@1.27.0

## 1.26.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.26.5
  - @zag-js/utils@1.26.5

## 1.26.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.26.4
  - @zag-js/utils@1.26.4

## 1.26.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.26.3
  - @zag-js/utils@1.26.3

## 1.26.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.26.2
  - @zag-js/utils@1.26.2

## 1.26.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.26.1
  - @zag-js/utils@1.26.1

## 1.26.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.26.0
  - @zag-js/utils@1.26.0

## 1.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.25.0
  - @zag-js/utils@1.25.0

## 1.24.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.24.2
  - @zag-js/utils@1.24.2

## 1.24.1

### Patch Changes

- Updated dependencies [[`ab0d4f7`](https://github.com/chakra-ui/zag/commit/ab0d4f73d6ca0571cb09ebad5bf724fe81e94ef8)]:
  - @zag-js/core@1.24.1
  - @zag-js/utils@1.24.1

## 1.24.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.24.0
  - @zag-js/utils@1.24.0

## 1.23.0

### Patch Changes

- Updated dependencies [[`50391e1`](https://github.com/chakra-ui/zag/commit/50391e11eb7f9af1f23f44661a8bc522c591175c)]:
  - @zag-js/core@1.23.0
  - @zag-js/utils@1.23.0

## 1.22.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.22.1
  - @zag-js/utils@1.22.1

## 1.22.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.22.0
  - @zag-js/utils@1.22.0

## 1.21.9

### Patch Changes

- [`0e62c21`](https://github.com/chakra-ui/zag/commit/0e62c21c9a0c5eede7740d8422dfd6a4fa3b1032) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - ## Fixed
  - Fixed critical race conditions and dual operations in sort functionality that could cause stale data overwrites and
    unexpected behavior
  - Fixed event handling during async operations - users can now properly interrupt sorting with RELOAD, FILTER, or new
    SORT events
  - Enhanced `SortDetails` interface with `filterText` parameter for consistent filtering context across local and
    server-side operations

- Updated dependencies []:
  - @zag-js/core@1.21.9
  - @zag-js/utils@1.21.9

## 1.21.8

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.8
  - @zag-js/utils@1.21.8

## 1.21.7

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.7
  - @zag-js/utils@1.21.7

## 1.21.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.6
  - @zag-js/utils@1.21.6

## 1.21.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.5
  - @zag-js/utils@1.21.5

## 1.21.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.4
  - @zag-js/utils@1.21.4

## 1.21.3

### Patch Changes

- [`374aa4d`](https://github.com/chakra-ui/zag/commit/374aa4d8e249d4d7f4ac497926bd716686e0abfa) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve type inference for descriptors

- Updated dependencies []:
  - @zag-js/core@1.21.3
  - @zag-js/utils@1.21.3

## 1.21.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.2
  - @zag-js/utils@1.21.2

## 1.21.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.1
  - @zag-js/utils@1.21.1

## 1.21.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.21.0
  - @zag-js/utils@1.21.0

## 1.20.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.20.1
  - @zag-js/utils@1.20.1

## 1.20.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.20.0
  - @zag-js/utils@1.20.0

## 1.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.19.0
  - @zag-js/utils@1.19.0

## 1.18.5

### Patch Changes

- [`59a7bfb`](https://github.com/chakra-ui/zag/commit/59a7bfb7215b4c9d13d11487f50ad852cd8347a9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue destructuring returned api could throw an ESLint
  `unbound-method` warning

- Updated dependencies []:
  - @zag-js/core@1.18.5
  - @zag-js/utils@1.18.5

## 1.18.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.18.4
  - @zag-js/utils@1.18.4

## 1.18.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.18.3
  - @zag-js/utils@1.18.3

## 1.18.2

### Patch Changes

- Updated dependencies [[`11843e6`](https://github.com/chakra-ui/zag/commit/11843e6adf62b906006890c8003b38da2850c8ee)]:
  - @zag-js/utils@1.18.2
  - @zag-js/core@1.18.2

## 1.18.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.18.1
  - @zag-js/utils@1.18.1

## 1.18.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.18.0
  - @zag-js/utils@1.18.0

## 1.17.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.17.4
  - @zag-js/utils@1.17.4

## 1.17.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.17.3
  - @zag-js/utils@1.17.3

## 1.17.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.17.2
  - @zag-js/utils@1.17.2

## 1.17.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.17.1
  - @zag-js/utils@1.17.1

## 1.17.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.17.0
  - @zag-js/utils@1.17.0

## 1.16.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.16.0
  - @zag-js/utils@1.16.0

## 1.15.7

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.15.7
  - @zag-js/utils@1.15.7

## 1.15.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.15.6
  - @zag-js/utils@1.15.6

## 1.15.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.15.5
  - @zag-js/utils@1.15.5

## 1.15.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.15.4
  - @zag-js/utils@1.15.4

## 1.15.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.15.3
  - @zag-js/utils@1.15.3

## 1.15.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@1.15.2
  - @zag-js/utils@1.15.2

## 1.15.1

### Patch Changes

- [`9f25fe1`](https://github.com/chakra-ui/zag/commit/9f25fe15b13c0cf7321d83cab8ae5fd5d529ec46) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release of async list controller

- Updated dependencies []:
  - @zag-js/core@1.15.1
  - @zag-js/utils@1.15.1
