"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { ChevronsUpDownIcon, XIcon } from "lucide-react"
import { useId, useMemo } from "react"
import { LoadMore } from "@/components/load-more"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/select.css"

interface Pokemon {
  name: string
  url: string
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
        <label {...api.getLabelProps()}>Pokemon</label>
        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <span>{api.valueAsString || "Select a Pokemon"}</span>
          </button>
          <div className="select-indicator-group">
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
            <span {...api.getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </div>
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
                  >
                    Loading more...
                  </LoadMore>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
