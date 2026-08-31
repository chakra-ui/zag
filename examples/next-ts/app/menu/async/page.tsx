"use client"

import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import { LoadMore } from "@/components/load-more"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/menu.css"

interface Character {
  name: string
}

export default function Page() {
  const hasOpened = useRef(false)

  const listApi = useAsyncList<Character>({
    autoReload: false,
    async load({ signal, cursor }) {
      if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")
      await new Promise((resolve) => setTimeout(resolve, 400))
      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/", { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
    },
  })

  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: console.log,
    onOpenChange({ open }) {
      if (open && !hasOpened.current) {
        hasOpened.current = true
        listApi.reload()
      }
    },
  })
  const api = menu.connect(service, normalizeProps)

  const isInitialLoading = listApi.isLoading && listApi.items.length === 0

  return (
    <main style={{ padding: 40 }}>
      <p style={{ marginBottom: 16, color: "#666" }}>
        Opens empty, loads SWAPI people on first open, then fetches the next page when you scroll to the bottom.
      </p>
      <div>
        <button {...api.getTriggerProps()}>
          Characters <span {...api.getIndicatorProps()}>▾</span>
        </button>
        {api.open && (
          <Portal>
            <div {...api.getPositionerProps()}>
              <ul
                {...mergeProps(api.getContentProps(), {
                  "aria-label": "Characters",
                  style: { maxHeight: 240, overflowY: "auto" as const, width: 220 },
                })}
              >
                {isInitialLoading && (
                  <li style={{ padding: "8px 6px", fontSize: 13 }}>
                    <output aria-live="polite">Loading…</output>
                  </li>
                )}
                {listApi.error && (
                  <li style={{ padding: "8px 6px", fontSize: 13 }}>
                    <output>Couldn&apos;t load characters</output>
                  </li>
                )}
                {!isInitialLoading && listApi.isEmpty && !listApi.error && (
                  <li style={{ padding: "8px 6px", fontSize: 13 }}>
                    <output>No characters found</output>
                  </li>
                )}
                {listApi.items.map((item) => (
                  <li key={item.name} {...api.getItemProps({ value: item.name, valueText: item.name })}>
                    {item.name}
                  </li>
                ))}
                {!isInitialLoading && (
                  <LoadMore
                    as="li"
                    count={listApi.items.length}
                    hasMore={listApi.hasMore}
                    loading={listApi.isLoading}
                    onLoadMore={() => listApi.loadMore()}
                  />
                )}
              </ul>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
