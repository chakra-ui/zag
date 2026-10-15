<script lang="ts">
  import { useInfiniteScroll } from "$lib/use-infinite-scroll.svelte"
  import * as asyncList from "@zag-js/async-list"
  import { useMachine } from "@zag-js/svelte"
  import "@styles/infinite-scroll.css"

  interface Person {
    name: string
    url: string
    birth_year: string
  }

  const id = $props.id()

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

  const scroll = useInfiniteScroll(() => ({
    id,
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  }))

  const searching = $derived(list.isLoading && !list.isLoadingMore)
</script>

<main class="infinite-scroll">
  <input
    type="search"
    aria-label="Search people"
    placeholder="Search people…"
    oninput={(event) => list.setFilter(event.currentTarget.value)}
  />
  <p data-testid="summary">{list.items.length} loaded{searching ? " · Searching…" : ""}</p>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="scroller" tabindex="0" aria-busy={list.isLoading || undefined}>
    <ul>
      {#each list.items as item (item.url)}
        <li>{item.name} <small>{item.birth_year}</small></li>
      {/each}
    </ul>
    {#if !list.isLoading && list.isEmpty}
      <div class="footer">No people found</div>
    {/if}
    <div {...scroll().getSentinelProps()}></div>
    {#if list.isLoadingMore}
      <div {...scroll().getIndicatorProps({ type: "loading" })}>Loading more…</div>
    {/if}
    {#if !list.isLoading && !list.isEmpty}
      <div {...scroll().getIndicatorProps({ type: "complete" })}>You’ve reached the end</div>
    {/if}
  </div>
</main>
