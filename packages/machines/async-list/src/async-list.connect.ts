import type { AsyncListApi, AsyncListService } from "./async-list.types"

export function connect<T, C>(service: AsyncListService<T, C>): AsyncListApi<T, C> {
  const { state, context, send } = service

  const loading = state.matches("loading", "sorting")
  const sorting = state.matches("sorting")

  const items = context.get("items")
  const cursor = context.get("cursor")

  const empty = items.length === 0
  const hasMore = cursor != null

  return {
    items,
    sortDescriptor: context.get("sortDescriptor"),
    loading,
    sorting,
    empty,
    hasMore,
    error: context.get("error"),
    filterText: context.get("filterText"),
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
    sort(sortDescriptor) {
      send({ type: "SORT", sortDescriptor })
    },
    setFilterText(filterText) {
      send({ type: "FILTER", filterText })
    },
    clearFilter() {
      send({ type: "FILTER", filterText: "" })
    },
  }
}
