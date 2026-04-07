import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId, useMemo, useRef } from "react"
import { useAsyncList } from "../../hooks/use-async-list"
import { useSentinelObserver } from "../../hooks/use-sentinel-observer"

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

  useSentinelObserver({
    getSentinel: () => sentinelRef.current,
    onIntersect() {
      if (listApi.hasMore && !listApi.isLoading) listApi.loadMore()
    },
  })

  const collection = useMemo(
    () =>
      select.collection({
        items: listApi.items,
        itemToValue: (item) => item.name,
        itemToString: (item) => item.name,
      }),
    [listApi.items],
  )

  const service = useMachine(select.machine, { id: useId(), collection })
  const api = select.connect(service, normalizeProps)

  const isInitialLoading = listApi.isLoading && listApi.items.length === 0
  const isLoadingMore = listApi.isLoading && listApi.items.length > 0

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Pokemon</label>
          <button {...api.getTriggerProps()}>{api.valueAsString || "Select a Pokemon"}</button>
          <button {...api.getClearTriggerProps()}>✕</button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              {isInitialLoading && (
                <div role="status" aria-live="polite" style={{ padding: "8px 12px" }}>
                  Loading...
                </div>
              )}

              {listApi.items.map((item) => (
                <div key={item.name} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.name}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              ))}

              <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

              {isLoadingMore && (
                <div role="status" aria-live="polite" style={{ padding: "8px 12px" }}>
                  Loading more...
                </div>
              )}
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
