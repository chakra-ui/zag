import type { EventObject, Service, Machine } from "@zag-js/core"

export type SortDirection = "ascending" | "descending"

export interface SortDescriptor<Item> {
  column: keyof Item
  direction: SortDirection
}

export interface LoadDetails<Filter, Sorting, Cursor> {
  signal: AbortSignal | undefined
  filter: Filter
  cursor?: Cursor | undefined
  sorting?: Sorting | undefined
}

export interface LoadResult<Item, Cursor> {
  items: Item[]
  cursor?: Cursor | undefined
}

export interface SortDetails<Item, Filter, Sorting> {
  items: Item[]
  sorting: Sorting
  filter: Filter
}

export type LoadDependency = string | number | boolean | undefined | null

export interface AsyncListProps<Item, Filter, Sorting, Cursor> {
  /**
   * The function to call when the list is loaded
   */
  load: (args: LoadDetails<Filter, Sorting, Cursor>) => Promise<LoadResult<Item, Cursor>>
  /**
   * The function to call when the list is sorted client-side.
   * When provided, sorting is performed locally instead of triggering a new load.
   */
  sort?:
    | ((args: SortDetails<Item, Filter, Sorting>) => Promise<{ items: Item[] }> | { items: Item[] } | undefined)
    | undefined
  /**
   * The initial items to display
   */
  initialItems?: Item[] | undefined
  /**
   * The initial sorting state
   */
  initialSorting?: Sorting | undefined
  /**
   * The initial filter state
   */
  initialFilter?: Filter | undefined
  /**
   * Whether to keep the previous items visible while new data is loading.
   * Prevents content flash when filter or sort changes.
   * @default false
   */
  keepPreviousItems?: boolean | undefined
  /**
   * The dependencies to watch for changes
   */
  dependencies?: LoadDependency[] | undefined
  /**
   * Whether to automatically reload the list when the dependencies change
   */
  autoReload?: boolean | undefined
  /**
   * The function to call when the list is loaded successfully
   */
  onSuccess?: ((details: { items: Item[] }) => void | undefined) | undefined
  /**
   * The function to call when the list fails to load
   */
  onError?: ((details: { error: Error }) => void | undefined) | undefined
}

export interface AsyncListSchema<Item, Filter, Sorting, Cursor> {
  state: "idle" | "loading" | "sorting"
  props: AsyncListProps<Item, Filter, Sorting, Cursor>
  context: {
    items: Item[]
    filter: Filter
    cursor?: Cursor | undefined
    sorting?: Sorting | undefined
    error?: any | undefined
    isLoadMore: boolean
  }
  refs: {
    abort: AbortController | null
    seq: number
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type AsyncListService<Item, Filter, Sorting, Cursor> = Service<AsyncListSchema<Item, Filter, Sorting, Cursor>>

export type AsyncListMachine<Item, Filter, Sorting, Cursor> = Machine<AsyncListSchema<Item, Filter, Sorting, Cursor>>

type Updater<T> = T | ((prev: T) => T)

export interface AsyncListApi<Item, Filter, Sorting, Cursor> {
  /**
   * The items in the list.
   */
  items: Item[]
  /**
   * The current filter state.
   */
  filter: Filter
  /**
   * The cursor for pagination.
   */
  cursor: Cursor | undefined
  /**
   * The current sorting state.
   */
  sorting: Sorting | undefined
  /**
   * Whether the list is loading (includes both fetching and sorting).
   */
  isLoading: boolean
  /**
   * Whether the list is loading more items via pagination.
   */
  isLoadingMore: boolean
  /**
   * Whether a client-side sort is in progress.
   */
  isSorting: boolean
  /**
   * Whether the list is empty.
   */
  isEmpty: boolean
  /**
   * Whether there are more items to load.
   */
  hasMore: boolean
  /**
   * The error instance returned by the last fetch.
   */
  error: any | undefined
  /**
   * Function to abort the current fetch.
   */
  abort: VoidFunction
  /**
   * Function to reload the list
   */
  reload: VoidFunction
  /**
   * Function to load more items
   */
  loadMore: VoidFunction
  /**
   * Function to update the sorting state and trigger a sort.
   * Accepts a value or an updater function.
   */
  setSorting: (sorting: Updater<Sorting | undefined>) => void
  /**
   * Function to update the filter state and trigger a reload.
   * Accepts a value or an updater function.
   */
  setFilter: (filter: Updater<Filter>) => void
  /**
   * Function to reset the filter to `initialFilter`.
   * No-op if `initialFilter` was not provided.
   */
  clearFilter: VoidFunction
}
