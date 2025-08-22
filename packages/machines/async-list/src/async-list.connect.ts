import type { AsyncListApi, AsyncListService } from "./async-list.types"

export function connect<T, C>(service: AsyncListService<T, C>): AsyncListApi<T, C> {
  const { state, context, send } = service
  const loading = state.matches("loading")
  return {
    items: context.get("items"),
    sortDescriptor: context.get("sortDescriptor"),
    loading,
    error: context.get("error"),
    filterText: context.get("filterText"),
    cursor: context.get("cursor"),
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
  }
}
