<script lang="ts">
  import Output from "$lib/components/output.svelte"
  import { useInfiniteScroll } from "$lib/use-infinite-scroll.svelte"
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

  const id = $props.id()
  const spinnerId = `${id}-spinner`
  let selected = $state<string[]>([])

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

  const list = $derived(asyncList.connect(listService))

  const collection = $derived(
    combobox.collection({
      items: list.items,
      itemToValue: (item) => item.url,
      itemToString: (item) => item.name,
    }),
  )

  const service = useMachine(combobox.machine as combobox.Machine<Person>, (): combobox.Props<Person> => ({
    id,
    collection,
    placeholder: "Search people…",
    // Wrapping to the top would skip the next page
    loopFocus: false,
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list.setFilter(inputValue)
    },
    onValueChange({ items }) {
      selected = items.map((item) => item.name)
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))

  // Load-more has its own spinner at the end of the list
  const searching = $derived(list.isLoading && !list.isLoadingMore)

  const scroll = useInfiniteScroll(() => ({
    id: `${id}-scroll`,
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  }))

  const status = $derived.by(() => {
    if (list.error || !list.isEmpty) return null
    if (searching) return "Searching…"
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
        <input data-testid="input" {...api.getInputProps()} aria-describedby={searching ? spinnerId : undefined} />
        {#if searching}
          <span
            id={spinnerId}
            role="progressbar"
            aria-label="Loading results"
            class="combobox-spinner"
            data-testid="loading"
          >
            <LoaderCircleIcon />
          </span>
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
            {#each list.items as item (item.url)}
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
            <div {...scroll().getSentinelProps()}></div>
            {#if list.isLoadingMore}
              <div class="combobox-load-more" role="progressbar" aria-label="Loading more people">
                <span class="combobox-spinner">
                  <LoaderCircleIcon />
                </span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
