<script lang="ts">
  import Output from "$lib/components/output.svelte"
  import * as asyncList from "@zag-js/async-list"
  import * as combobox from "@zag-js/combobox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from "lucide-svelte"
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

  let selected = $state<string[]>([])

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

  const list = $derived(asyncList.connect(listService))

  const collection = $derived(
    combobox.collection({
      items: list.items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Person>, (): combobox.Props<Person> => ({
    id,
    collection,
    placeholder: "Search people…",
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list.setFilter(inputValue)
    },
    onValueChange({ value }) {
      selected = value
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))

  const status = $derived.by(() => {
    if (list.error || !list.isEmpty) return null
    if (list.isLoading) return "Searching…"
    const query = list.filter?.trim()
    return query ? `No people match “${query}”` : "No people found"
  })
</script>

<main class="combobox">
  <div class="vstack gap-6">
    <Output label="Selected" value={selected.join(", ") || "—"} data-testid="selected-value" />

    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Star Wars character</label>
      <div {...api.getControlProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        {#if list.isLoading}
          <LoaderCircleIcon class="combobox-spinner" aria-hidden="true" data-testid="loading" />
        {/if}
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <button data-testid="trigger" {...api.getTriggerProps()}>
          <ChevronsUpDownIcon />
        </button>
      </div>
    </div>

    <div {...api.getPositionerProps()}>
      <div data-testid="combobox-content" {...api.getContentProps()} aria-busy={list.isLoading || undefined}>
        <div {...api.getEmptyProps()}>
          {#if list.error}
            <span class="combobox-status" data-type="error">
              Couldn’t load people.
              <button type="button" onclick={() => list.reload()}>Retry</button>
            </span>
          {:else if status}{status}{/if}
        </div>
        {#if !list.isEmpty}
          <div {...api.getListProps()}>
            {#each list.items as item (item.name)}
              <div data-testid={`item-${item.name}`} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.name}</span>
                {#if item.birth_year}
                  <span class="combobox-item-meta">{item.birth_year}</span>
                {/if}
                <span {...api.getItemIndicatorProps({ item })}>
                  <CheckIcon />
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
