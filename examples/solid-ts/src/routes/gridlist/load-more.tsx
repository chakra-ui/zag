import * as asyncList from "@zag-js/async-list"
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll"
import "@styles/gridlist.css"

interface Pokemon {
  name: string
  url: string
}

export default function Page() {
  const listService = useMachine(asyncList.machine as asyncList.Machine<Pokemon>, {
    autoReload: true,
    async load({ signal, cursor }) {
      const url = cursor ?? "https://pokeapi.co/api/v2/pokemon?limit=20"
      const res = await fetch(url, { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
    },
  })
  const listApi = createMemo(() => asyncList.connect(listService))

  const scrollApi = useInfiniteScroll(() => ({
    count: listApi().items.length,
    hasMore: listApi().hasMore,
    loading: listApi().isLoading,
    onLoadMore: () => listApi().loadMore(),
  }))

  const collection = createMemo(() =>
    gridlist.collection<Pokemon>({
      items: listApi().items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(gridlist.machine as gridlist.Machine<Pokemon>, () => ({
    id,
    collection: collection(),
    selectionMode: "single" as const,
  }))

  const api = createMemo(() => gridlist.connect(service, normalizeProps))

  const isInitialLoading = () => listApi().isLoading && listApi().items.length === 0
  const isLoadingMore = () => listApi().isLoading && listApi().items.length > 0

  return (
    <>
      <main>
        <div class="gridlist">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Pokemon ({listApi().items.length} loaded)</label>
            <div {...api().getContentProps()}>
              <Show when={isInitialLoading()}>
                <div role="status" aria-live="polite" style={{ padding: "12px 14px", color: "#71717a" }}>
                  Loading…
                </div>
              </Show>

              <For each={listApi().items}>
                {(item) => (
                  <div {...api().getItemProps({ item, focusOnHover: true })}>
                    <div {...api().getCellProps()}>
                      <Show when={api().hasCheckbox}>
                        <button {...api().getItemCheckboxProps({ item })}>
                          <CheckIcon {...api().getItemIndicatorProps({ item })} />
                        </button>
                      </Show>
                      <div class="gridlist-item-body">
                        <span {...api().getItemTextProps({ item })} class="gridlist-item-title">
                          {item.name}
                        </span>
                        <span class="gridlist-item-description">{item.url}</span>
                      </div>
                    </div>
                  </div>
                )}
              </For>

              <div {...scrollApi().getSentinelProps()} />

              <Show when={isLoadingMore()}>
                <div role="status" aria-live="polite" style={{ padding: "12px 14px", color: "#71717a" }}>
                  Loading more…
                </div>
              </Show>

              <Show when={!listApi().hasMore && !listApi().isLoading && listApi().items.length > 0}>
                <div role="status" aria-live="polite" style={{ padding: "12px 14px", color: "#a1a1aa" }}>
                  End of list
                </div>
              </Show>
            </div>
          </div>

          <p style={{ "margin-top": "12px", "font-size": "13px", color: "#52525b" }}>
            Selected: <strong>{api().valueAsString || "none"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
