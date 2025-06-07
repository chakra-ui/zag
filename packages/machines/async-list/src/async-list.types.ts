import type { EventObject, Service, Machine } from "@zag-js/core"

export type SortDirection = "ascending" | "descending"

export interface SortDescriptor {
  column: string
  direction: SortDirection
}

export interface LoadDetails<C> {
  signal: AbortSignal | undefined
  filterText: string
  cursor?: C | undefined
  sortDescriptor?: SortDescriptor | undefined
}

export interface LoadResult<T, C> {
  items: T[]
  cursor?: C
}

export interface SortDetails<T> {
  items: T[]
  descriptor: SortDescriptor
}

export type LoadDependency = string | number | boolean | undefined | null

export interface AsyncListProps<T, C> {
  /**
   * The function to call when the list is loaded
   */
  load: (args: LoadDetails<C>) => Promise<LoadResult<T, C>>
  /**
   * The function to call when the list is sorted
   */
  sort?: (args: SortDetails<T>) => Promise<{ items: T[] }> | { items: T[] } | undefined
  /**
   * The initial items to display
   */
  initialItems?: T[] | undefined
  /**
   * The initial sort descriptor to use
   */
  initialSortDescriptor?: SortDescriptor | undefined
  /**
   * The initial filter text to use
   */
  initialFilterText?: string | undefined
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
  onSuccess?: (details: { items: T[] }) => void | undefined
  /**
   * The function to call when the list fails to load
   */
  onError?: (details: { error: Error }) => void | undefined
}

export interface AsyncListSchema<T, C> {
  state: "idle" | "loading"
  props: AsyncListProps<T, C>
  context: {
    items: T[]
    filterText: string
    cursor?: C
    sortDescriptor?: SortDescriptor
    error?: any
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

export type AsyncListService<T, C> = Service<AsyncListSchema<T, C>>

export type AsyncListMachine<T, C> = Machine<AsyncListSchema<T, C>>

export interface AsyncListApi<T, C> {
  /**
   * The items in the list.
   */
  items: T[]
  /**
   * The filter text.
   */
  filterText: string
  /**
   * The cursor.
   */
  cursor: C | undefined
  /**
   * The sort descriptor.
   */
  sortDescriptor: SortDescriptor | undefined
  /**
   * Whether the list is loading.
   */
  loading: boolean
  /**
   * The error instance returned by the last fetch.
   */
  error: any | undefined
  /**
   * Function to abort the current fetch.
   */
  abort(): void
  /**
   * Function to reload the list
   */
  reload(): void
  /**
   * Function to load more items
   */
  loadMore(): void
  /**
   * Function to sort the list
   */
  sort(sortDescriptor: SortDescriptor): void
  /**
   * Function to set the filter text
   */
  setFilterText(filterText: string): void
}
