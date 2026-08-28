<script lang="ts">
  import * as infiniteScroll from "@zag-js/infinite-scroll"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/infinite-scroll.css"

  const PAGE_SIZE = 15
  const TOTAL = 60

  let items = $state<string[]>([])
  let loading = $state(false)

  // `loading` is fully owned by the consumer here — no promise is returned from onLoadMore.
  const id = $props.id()
  const service = useMachine(infiniteScroll.machine, () => ({
    id,
    count: items.length,
    hasMore: items.length < TOTAL,
    loading,
    onLoadMore() {
      loading = true
      setTimeout(() => {
        items = [...items, ...Array.from({ length: PAGE_SIZE }, (_, i) => `Row ${items.length + i + 1}`)]
        loading = false
      }, 600)
    },
  }))

  const api = $derived(infiniteScroll.connect(service, normalizeProps))
</script>

<main class="infinite-scroll">
  <h1>Infinite Scroll — Controlled loading</h1>
  <p>{loading ? "Loading…" : `Loaded ${items.length} / ${TOTAL}`}</p>
  <div class="scroller" tabindex="0">
    <ul>
      {#each items as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
    <div {...api.getSentinelProps()}></div>
    <div {...api.getIndicatorProps({ type: "loading" })}>Loading…</div>
    <div {...api.getIndicatorProps({ type: "complete" })}>End of list</div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
