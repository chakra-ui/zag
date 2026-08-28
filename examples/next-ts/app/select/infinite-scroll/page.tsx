"use client"

import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId, useMemo } from "react"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/select.css"

interface Pokemon {
  name: string
  url: string
}

interface LoadMoreProps {
  count: number
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
}

/**
 * Owns the sentinel and the machine that observes it, so both share one lifetime. Rendering it
 * only while the select is open is all it takes to scope loading to when the list is visible.
 */
function LoadMore(props: LoadMoreProps) {
  const service = useMachine(infiniteScroll.machine, { id: useId(), ...props })
  const api = infiniteScroll.connect(service, normalizeProps)
  return (
    <>
      <div {...api.getSentinelProps()} />
      <div {...api.getIndicatorProps({ type: "loading" })} style={{ padding: "8px 12px" }}>
        Loading more...
      </div>
    </>
  )
}

export default function Page() {
  const listApi = useAsyncList<Pokemon>({
    autoReload: true,
    async load({ signal, cursor }) {
      const url = cursor ?? "https://pokeapi.co/api/v2/pokemon?limit=20"
      const res = await fetch(url, { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
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

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Pokemon</label>
          <button {...api.getTriggerProps()}>{api.valueAsString || "Select a Pokemon"}</button>
          <button {...api.getClearTriggerProps()}>✕</button>
        </div>

        {api.open && (
          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                {isInitialLoading && (
                  <div role="status" aria-live="polite" style={{ padding: "8px 12px" }}>
                    Loading...
                  </div>
                )}

                <div {...api.getListProps()}>
                  {listApi.items.map((item) => (
                    <div key={item.name} {...api.getItemProps({ item })}>
                      <span {...api.getItemTextProps({ item })}>{item.name}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  ))}

                  <LoadMore
                    count={listApi.items.length}
                    hasMore={listApi.hasMore}
                    loading={listApi.isLoading}
                    onLoadMore={() => listApi.loadMore()}
                  />
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
