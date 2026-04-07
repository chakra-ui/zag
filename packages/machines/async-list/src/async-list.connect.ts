import type { AsyncListApi, AsyncListService } from "./async-list.types"

export function connect<Item, Filter, Sorting, Cursor>(
  service: AsyncListService<Item, Filter, Sorting, Cursor>,
): AsyncListApi<Item, Filter, Sorting, Cursor> {
  const { state, context, send, prop } = service

  const isLoading = state.matches("loading", "sorting")
  const isLoadingMore = state.matches("loading") && context.get("isLoadMore")
  const isSorting = state.matches("sorting")

  const items = context.get("items")
  const cursor = context.get("cursor")

  const isEmpty = items.length === 0
  const hasMore = cursor != null

  return {
    items,
    sorting: context.get("sorting"),
    isLoading,
    isLoadingMore,
    isSorting,
    isEmpty,
    hasMore,
    error: context.get("error"),
    filter: context.get("filter"),
    cursor,
    abort() {
      send({ type: "ABORT" })
    },
    reload() {
      send({ type: "RELOAD" })
    },
    loadMore() {
      send({ type: "LOAD_MORE" })
    },
    setSorting(sortingOrUpdater) {
      const sorting =
        typeof sortingOrUpdater === "function"
          ? (sortingOrUpdater as (prev: Sorting | undefined) => Sorting)(context.get("sorting"))
          : sortingOrUpdater
      send({ type: "SORT", sorting })
    },
    setFilter(filterOrUpdater) {
      const filter =
        typeof filterOrUpdater === "function"
          ? (filterOrUpdater as (prev: Filter) => Filter)(context.get("filter"))
          : filterOrUpdater
      send({ type: "FILTER", filter })
    },
    clearFilter() {
      const initial = prop("initialFilter")
      if (initial === undefined) return
      send({ type: "FILTER", filter: initial })
    },
  }
}
