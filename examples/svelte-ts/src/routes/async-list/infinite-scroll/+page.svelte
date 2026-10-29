<script lang="ts">
  import { useInfiniteScroll } from "#lib/use-infinite-scroll.svelte.ts"
  import * as asyncList from "@zag-js/async-list"
  import { useMachine } from "@zag-js/svelte"
  import { LoaderCircleIcon } from "lucide-svelte"
  import "@styles/async-list.css"

  interface Person {
    name: string
    url: string
    birth_year: string
  }

  const id = $props.id()

  const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
    autoReload: true,
    initialFilter: "",
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter, cursor }) {
      const search = encodeURIComponent(filter.trim())
      const response = await fetch(cursor ?? `https://swapi.py4e.com/api/people/?search=${search}`, { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results ?? [], cursor: data.next ?? undefined }
    },
  })

  const list = $derived(asyncList.connect(service))

  const scroll = useInfiniteScroll(() => ({
    id,
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  }))

  const searching = $derived(list.isLoading && !list.isLoadingMore)
</script>

<main>
  <div class="async-list">
    <div class="async-list-toolbar">
      <input
        type="search"
        aria-label="Search people"
        placeholder="Search people…"
        oninput={(event) => list.setFilter(event.currentTarget.value)}
      />
      <span class="async-list-meta" data-testid="summary">
        {searching ? "Searching…" : `${list.items.length} loaded`}
      </span>
    </div>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="async-list-panel async-list-scroller" tabindex="0" aria-label="People">
      {#if list.error}
        <div role="alert" class="async-list-status" data-type="error">
          Couldn’t load people.
          <button onclick={() => list.reload()}>Retry</button>
        </div>
      {:else if list.isEmpty && list.isLoading}
        <div role="status" class="async-list-status">
          <LoaderCircleIcon class="async-list-spinner" /> Loading people…
        </div>
      {:else if list.isEmpty}
        <div class="async-list-status">No people found</div>
      {:else}
        <ul class="async-list-items" aria-busy={searching}>
          {#each list.items as person (person.url)}
            <li>
              {person.name}
              <span class="async-list-meta">{person.birth_year}</span>
            </li>
          {/each}
        </ul>
      {/if}
      <div {...scroll().getSentinelProps()}></div>
      {#if list.isLoadingMore}
        <div {...scroll().getIndicatorProps({ type: "loading" })} class="async-list-status">
          <LoaderCircleIcon class="async-list-spinner" /> Loading more…
        </div>
      {/if}
      {#if !list.isLoading && !list.isEmpty}
        <div {...scroll().getIndicatorProps({ type: "complete" })} class="async-list-status">
          You’ve reached the end
        </div>
      {/if}
    </div>
  </div>
</main>
