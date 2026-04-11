import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon } from "lucide-react"
import { useId, useMemo, useRef } from "react"
import { useAsyncList } from "../../hooks/use-async-list"
import { useLoadMoreSentinel } from "../../hooks/use-load-more-sentinel"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

interface Pokemon {
  name: string
  url: string
}

export default function Page() {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const listApi = useAsyncList<Pokemon>({
    autoReload: true,
    async load({ signal, cursor }) {
      const url = cursor ?? "https://pokeapi.co/api/v2/pokemon?limit=20"
      const res = await fetch(url, { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
    },
  })

  // Re-create the observer whenever new items are appended so cascading loads
  // keep firing until the viewport is full.
  useLoadMoreSentinel(sentinelRef, {
    collectionKey: listApi.items,
    onLoadMore() {
      if (listApi.hasMore && !listApi.isLoading) listApi.loadMore()
    },
  })

  const collection = useMemo(
    () =>
      gridlist.collection<Pokemon>({
        items: listApi.items,
        itemToValue: (item) => item.name,
        itemToString: (item) => item.name,
      }),
    [listApi.items],
  )

  const service = useMachine(gridlist.machine as gridlist.Machine<Pokemon>, {
    id: useId(),
    collection,
    selectionMode: "single",
  })

  const api = gridlist.connect(service, normalizeProps)

  const isInitialLoading = listApi.isLoading && listApi.items.length === 0
  const isLoadingMore = listApi.isLoading && listApi.items.length > 0

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Pokemon ({listApi.items.length} loaded)</label>
            <div {...api.getContentProps()}>
              {isInitialLoading && (
                <div role="status" aria-live="polite" style={{ padding: "12px 14px", color: "#71717a" }}>
                  Loading…
                </div>
              )}

              {listApi.items.map((item) => (
                <div key={item.name} {...api.getItemProps({ item, focusOnHover: true })}>
                  <div {...api.getCellProps()}>
                    {api.hasCheckbox && (
                      <button {...api.getItemCheckboxProps({ item })}>
                        <CheckIcon {...api.getItemIndicatorProps({ item })} />
                      </button>
                    )}
                    <div className="gridlist-item-body">
                      <span {...api.getItemTextProps({ item })} className="gridlist-item-title">
                        {item.name}
                      </span>
                      <span className="gridlist-item-description">{item.url}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sentinel — observed by useLoadMoreSentinel. */}
              <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

              {isLoadingMore && (
                <div role="status" aria-live="polite" style={{ padding: "12px 14px", color: "#71717a" }}>
                  Loading more…
                </div>
              )}

              {!listApi.hasMore && !listApi.isLoading && listApi.items.length > 0 && (
                <div role="status" aria-live="polite" style={{ padding: "12px 14px", color: "#a1a1aa" }}>
                  End of list
                </div>
              )}
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Selected: <strong>{api.valueAsString || "none"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
