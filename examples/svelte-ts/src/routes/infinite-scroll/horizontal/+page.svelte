<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import * as infiniteScroll from "@zag-js/infinite-scroll"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/infinite-scroll.css"

  const PAGE_SIZE = 10
  const TOTAL = 50

  const loadPage = (page: number): Promise<string[]> =>
    new Promise((resolve) => {
      const start = (page - 1) * PAGE_SIZE
      setTimeout(() => {
        resolve(Array.from({ length: Math.min(PAGE_SIZE, TOTAL - start) }, (_, i) => `Card ${start + i + 1}`))
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
  const service = useMachine(infiniteScroll.machine, () => ({
    id,
    orientation: "horizontal" as const,
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  }))

  const api = $derived(infiniteScroll.connect(service, normalizeProps))
</script>

<main class="infinite-scroll">
  <h1>Infinite Scroll — Horizontal</h1>
  <p>Loaded {list.items.length} / {TOTAL}</p>
  <div class="scroller horizontal" tabindex="0">
    {#each list.items as item (item)}
      <div class="card">
        {item}
      </div>
    {/each}
    <div {...api.getSentinelProps()}></div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
