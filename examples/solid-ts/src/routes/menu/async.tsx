import * as asyncList from "@zag-js/async-list"
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { LoadMore } from "../../components/load-more"
import "@styles/menu.css"

interface Character {
  name: string
}

export default function Page() {
  let hasOpened = false

  const listService = useMachine(asyncList.machine as asyncList.Machine<Character>, {
    autoReload: false,
    async load({ signal, cursor }) {
      if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")
      await new Promise((resolve) => setTimeout(resolve, 400))
      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/", { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
    },
  })
  const listApi = createMemo(() => asyncList.connect(listService))

  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    onSelect: console.log,
    onOpenChange({ open }) {
      if (open && !hasOpened) {
        hasOpened = true
        listApi().reload()
      }
    },
  })
  const api = createMemo(() => menu.connect(service, normalizeProps))

  const isInitialLoading = () => listApi().isLoading && listApi().items.length === 0

  return (
    <main style={{ padding: "40px" }}>
      <p style={{ "margin-bottom": "16px", color: "#666" }}>
        Opens empty, loads SWAPI people on first open, then fetches the next page when you scroll to the bottom.
      </p>
      <div>
        <button {...api().getTriggerProps()}>
          Characters <span {...api().getIndicatorProps()}>▾</span>
        </button>
        <Show when={api().open}>
          <Portal>
            <div {...api().getPositionerProps()}>
              <ul
                {...mergeProps(api().getContentProps(), {
                  "aria-label": "Characters",
                  style: { "max-height": "240px", "overflow-y": "auto", width: "220px" },
                })}
              >
                <Show when={isInitialLoading()}>
                  <li style={{ padding: "8px 6px", "font-size": "13px" }}>
                    <output aria-live="polite">Loading…</output>
                  </li>
                </Show>
                <Show when={listApi().error}>
                  <li style={{ padding: "8px 6px", "font-size": "13px" }}>
                    <output>Couldn't load characters</output>
                  </li>
                </Show>
                <Show when={!isInitialLoading() && listApi().isEmpty && !listApi().error}>
                  <li style={{ padding: "8px 6px", "font-size": "13px" }}>
                    <output>No characters found</output>
                  </li>
                </Show>
                <For each={listApi().items}>
                  {(item) => <li {...api().getItemProps({ value: item.name, valueText: item.name })}>{item.name}</li>}
                </For>
                <Show when={!isInitialLoading()}>
                  <LoadMore
                    as="li"
                    count={listApi().items.length}
                    hasMore={listApi().hasMore}
                    loading={listApi().isLoading}
                    onLoadMore={() => listApi().loadMore()}
                  />
                </Show>
              </ul>
            </div>
          </Portal>
        </Show>
      </div>
    </main>
  )
}
