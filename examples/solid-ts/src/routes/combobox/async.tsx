import * as asyncList from "@zag-js/async-list"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { Output } from "~/components/output"
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll"
import "@styles/combobox.css"

interface Person {
  name: string
  url: string
  birth_year?: string
}

export default function Page() {
  const id = createUniqueId()
  const spinnerId = `${id}-spinner`
  const [selected, setSelected] = createSignal<string[]>([])

  const listService = useMachine(asyncList.machine as asyncList.Machine<Person>, {
    autoReload: true,
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter, cursor }) {
      const search = encodeURIComponent(filter?.trim() ?? "")
      const response = await fetch(cursor ?? `https://swapi.py4e.com/api/people/?search=${search}`, { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results ?? [], cursor: data.next ?? undefined }
    },
  })
  const list = createMemo(() => asyncList.connect(listService))

  const collection = createMemo(() =>
    combobox.collection({
      items: list().items,
      itemToValue: (item) => item.url,
      itemToString: (item) => item.name,
    }),
  )

  const service = useMachine(combobox.machine as combobox.Machine<Person>, () => ({
    id,
    collection: collection(),
    placeholder: "Search people…",
    // Wrapping to the top would skip the next page
    loopFocus: false,
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list().setFilter(inputValue)
    },
    onValueChange({ items }) {
      setSelected(items.map((item) => item.name))
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  // Load-more has its own spinner at the end of the list
  const searching = () => list().isLoading && !list().isLoadingMore

  const scroll = useInfiniteScroll(() => ({
    count: list().items.length,
    hasMore: list().hasMore,
    loading: list().isLoading,
    onLoadMore: () => list().loadMore(),
  }))

  const status = () => {
    const { error, isEmpty, filter } = list()
    if (error || !isEmpty) return null
    if (searching()) return "Searching…"
    const query = filter?.trim()
    return query ? `No people match “${query}”` : "No people found"
  }

  return (
    <main class="combobox">
      <div class="vstack gap-6">
        <Output label="Selected" value={selected().join(", ") || "—"} data-testid="selected-value" />

        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Star Wars character</label>
          <div {...api().getControlProps()}>
            <input
              data-testid="input"
              {...api().getInputProps()}
              aria-describedby={searching() ? spinnerId : undefined}
            />
            <Show when={searching()}>
              <span
                id={spinnerId}
                role="progressbar"
                aria-label="Loading results"
                class="combobox-spinner"
                data-testid="loading"
              >
                <LoaderCircleIcon />
              </span>
            </Show>
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
            <button data-testid="trigger" {...api().getTriggerProps()}>
              <ChevronsUpDownIcon />
            </button>
          </div>
        </div>

        <div {...api().getPositionerProps()}>
          <div data-testid="combobox-content" {...api().getContentProps()} aria-busy={list().isLoading || undefined}>
            <div {...api().getEmptyProps()}>
              <Show when={list().error} fallback={status()}>
                <span class="combobox-status" data-type="error">
                  Couldn’t load people.
                  <button type="button" onClick={() => list().reload()}>
                    Retry
                  </button>
                </span>
              </Show>
            </div>
            <Show when={!list().isEmpty}>
              <div {...api().getListProps()}>
                <For each={list().items}>
                  {(item) => (
                    <div data-testid={`item-${item.name}`} {...api().getItemProps({ item })}>
                      <span {...api().getItemTextProps({ item })}>{item.name}</span>
                      <Show when={item.birth_year}>
                        <span class="combobox-item-meta">{item.birth_year}</span>
                      </Show>
                      <span {...api().getItemIndicatorProps({ item })}>
                        <CheckIcon />
                      </span>
                    </div>
                  )}
                </For>
                <div {...scroll().getSentinelProps()} />
                <Show when={list().isLoadingMore}>
                  <div class="combobox-load-more" role="progressbar" aria-label="Loading more people">
                    <span class="combobox-spinner">
                      <LoaderCircleIcon />
                    </span>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </main>
  )
}
