import * as asyncList from "@zag-js/async-list"
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon, XIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { LoadMore } from "~/components/load-more"
import "@styles/select.css"

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

  const collection = createMemo(() =>
    select.collection({
      items: listApi().items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(select.machine as select.Machine<Pokemon>, () => ({ id, collection: collection() }))
  const api = createMemo(() => select.connect(service, normalizeProps))

  const isInitialLoading = () => listApi().isLoading && listApi().items.length === 0

  return (
    <main class="select">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Pokemon</label>
        <div {...api().getControlProps()}>
          <button {...api().getTriggerProps()}>
            <span>{api().valueAsString || "Select a Pokemon"}</span>
          </button>
          <div class="select-indicator-group">
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
            <span {...api().getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </div>
        </div>

        <Show when={api().open}>
          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <Show when={isInitialLoading()}>
                  <div role="status" aria-live="polite" style={{ padding: "8px 12px" }}>
                    Loading...
                  </div>
                </Show>

                <div {...api().getListProps()}>
                  <For each={listApi().items}>
                    {(item) => (
                      <div {...api().getItemProps({ item })}>
                        <span {...api().getItemTextProps({ item })}>{item.name}</span>
                        <span {...api().getItemIndicatorProps({ item })}>✓</span>
                      </div>
                    )}
                  </For>

                  <LoadMore
                    count={listApi().items.length}
                    hasMore={listApi().hasMore}
                    loading={listApi().isLoading}
                    onLoadMore={() => listApi().loadMore()}
                  >
                    Loading more...
                  </LoadMore>
                </div>
              </div>
            </div>
          </Portal>
        </Show>
      </div>
    </main>
  )
}
