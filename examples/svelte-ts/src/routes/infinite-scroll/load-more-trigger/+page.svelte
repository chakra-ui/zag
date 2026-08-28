<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import * as infiniteScroll from "@zag-js/infinite-scroll"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/infinite-scroll.css"

  const PAGE_SIZE = 20
  const TOTAL = 80

  const loadPage = (page: number): Promise<string[]> =>
    new Promise((resolve) => {
      const start = (page - 1) * PAGE_SIZE
      setTimeout(() => {
        resolve(Array.from({ length: Math.min(PAGE_SIZE, TOTAL - start) }, (_, i) => `Item ${start + i + 1}`))
      }, 500)
    })

  const listService = useMachine(asyncList.machine as asyncList.Machine<string>, {
    autoReload: true,
    async load({ cursor }) {
      const page = cursor ? Number(cursor) : 1
      const items = await loadPage(page)
      return { items, cursor: page * PAGE_SIZE < TOTAL ? String(page + 1) : undefined }
    },
  })
  const list = $derived(asyncList.connect(listService))

  const id = $props.id()
  let disabled = $state(false)

  const service = useMachine(infiniteScroll.machine, () => ({
    id,
    disabled,
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  }))

  const api = $derived(infiniteScroll.connect(service, normalizeProps))
</script>

<main class="infinite-scroll">
  <h1>Infinite Scroll — Keyboard reachable trigger</h1>
  <p>Auto-loads on scroll, and stays reachable by keyboard. Loaded {list.items.length} / {TOTAL}</p>
  <label>
    <input type="checkbox" bind:checked={disabled} />
    Disable auto-loading
  </label>
  <div class="scroller" tabindex="0">
    <ul>
      {#each list.items as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
    <div {...api.getSentinelProps()}></div>
    <div>
      {#if api.hasMore}
        <button type="button" onclick={() => api.loadMore()} disabled={api.loading}>
          {api.loading ? "Loading…" : "Load more"}
        </button>
      {:else}
        <span>End of list</span>
      {/if}
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
