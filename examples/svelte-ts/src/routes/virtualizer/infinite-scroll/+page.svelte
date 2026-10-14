<script lang="ts">
  import { useInfiniteScroll } from "$lib/use-infinite-scroll.svelte"
  import { useListVirtualizer } from "$lib/use-virtualizer.svelte"
  import { mergeProps, normalizeProps } from "@zag-js/svelte"

  const TOTAL_ITEMS = 1000
  const PAGE_SIZE = 50
  const ROW_HEIGHT = 56

  const estimateSize = () => ROW_HEIGHT

  const allItems = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
    id: `item-${index}`,
    title: `Issue ${index + 1}`,
    status: index % 3 === 0 ? "Triaged" : index % 3 === 1 ? "In progress" : "Backlog",
  }))

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  let loadedCount = $state(PAGE_SIZE)
  const items = $derived(allItems.slice(0, loadedCount))

  let scroller: HTMLElement | null = null
  const { virtualizer, init } = useListVirtualizer(() => ({
    count: items.length,
    estimatedSize: estimateSize,
    overscan: 4,
  }))

  const setScroller = (el: HTMLElement) => {
    scroller = el
    init(el)
  }

  const id = $props.id()
  const api = useInfiniteScroll(() => ({
    id,
    count: items.length,
    hasMore: loadedCount < TOTAL_ITEMS,
    scrollEl: () => scroller,
    // The returned promise drives the loading state
    async onLoadMore() {
      await wait(500)
      loadedCount = Math.min(loadedCount + PAGE_SIZE, TOTAL_ITEMS)
    },
  }))
</script>

<main style="padding: 20px; max-width: 720px; width: 100%">
  <h1>Infinite Scroll + Virtualized</h1>
  <p style="color: #64748b; font-size: 14px">
    Loaded {items.length} of {TOTAL_ITEMS} rows. The infinite-scroll sentinel sits after the virtual rows, so it is always
    mounted.
  </p>

  <div
    {@attach setScroller}
    tabindex="0"
    role="region"
    aria-label="Virtualized infinite list"
    style="height: 420px; width: 100%; overflow: auto; border: 1px solid #cbd5e1; border-radius: 8px; margin-top: 16px; box-sizing: border-box"
    onscroll={virtualizer.handleScroll}
  >
    <div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative">
      {#each virtualizer.getVirtualItems() as virtualItem (virtualItem.index)}
        {@const item = items[virtualItem.index]}
        {#if item}
          <div
            {...normalizeProps.element({
              style: {
                ...virtualizer.getItemStyle(virtualItem),
                height: `${virtualItem.size}px`,
                padding: "0 16px",
                borderBottom: "1px solid #e2e8f0",
                boxSizing: "border-box",
                background: virtualItem.index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              },
            })}
          >
            <strong>{item.title}</strong>
            <span style="color: #64748b; font-size: 13px">{item.status}</span>
          </div>
        {/if}
      {/each}
    </div>

    <div {...mergeProps(api().getSentinelProps(), { style: "height: 1px" })}></div>
    <div {...mergeProps(api().getIndicatorProps({ type: "loading" }), { style: "padding: 12px; color: #64748b" })}>
      Loading more…
    </div>
    <div {...mergeProps(api().getIndicatorProps({ type: "complete" }), { style: "padding: 12px; color: #64748b" })}>
      You're all caught up
    </div>
  </div>

  <p style="margin-top: 12px; font-size: 13px; color: #64748b">
    Rendered: {virtualizer.getVirtualItems().length} rows
    {loadedCount < TOTAL_ITEMS ? ` · Next page starts at ${items.length + 1}` : " · Complete"}
  </p>
</main>
