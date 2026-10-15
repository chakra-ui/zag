import * as asyncList from "@zag-js/async-list"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { Output } from "~/components/output"
import "@styles/combobox.css"

interface Person {
  name: string
  url: string
  birth_year?: string
}

// Resolves after `ms`, or rejects when the request is superseded
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

export default function Page() {
  const [selected, setSelected] = createSignal<string[]>([])

  const listService = useMachine(asyncList.machine as asyncList.Machine<Person>, {
    autoReload: true,
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter }) {
      // Debounce: each keystroke aborts the pending wait
      await delay(250, signal)
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter ?? ""}`, { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results ?? [] }
    },
  })
  const list = createMemo(() => asyncList.connect(listService))

  const collection = createMemo(() =>
    combobox.collection({
      items: list().items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(combobox.machine as combobox.Machine<Person>, () => ({
    id,
    collection: collection(),
    placeholder: "Search people…",
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list().setFilter(inputValue)
    },
    onValueChange({ value }) {
      setSelected(value)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  const status = () => {
    const { error, isLoading, isEmpty, filter } = list()
    if (error || !isEmpty) return null
    if (isLoading) return "Searching…"
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
            <input data-testid="input" {...api().getInputProps()} />
            <Show when={list().isLoading}>
              <LoaderCircleIcon class="combobox-spinner" aria-hidden data-testid="loading" />
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
              </div>
            </Show>
          </div>
        </div>
      </div>
    </main>
  )
}
