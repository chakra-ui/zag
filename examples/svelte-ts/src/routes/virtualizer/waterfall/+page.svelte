<script lang="ts">
  import { useWaterfallVirtualizer } from "$lib/use-virtualizer.svelte"

  const ITEM_COUNT = 1_000

  function getItemHeight(index: number) {
    const hash = ((index * 1103515245 + 12345) >>> 0) % 170
    return 120 + hash
  }

  const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
    id: `item-${index}`,
    title: `Card ${index + 1}`,
    subtitle: `Score ${(index * 37) % 100}`,
    height: getItemHeight(index),
  }))

  let scrollEl = $state<HTMLDivElement | null>(null)

  const { virtualizer, init } = useWaterfallVirtualizer({
    count: ITEM_COUNT,
    columnCount: 3,
    columnGap: 12,
    rowGap: 12,
    overscan: 6,
    estimatedSize: (index: number) => getItemHeight(index),
  })

  $effect(() => {
    init(scrollEl)
  })
</script>

<main style="padding: 20px; width: 100%; max-width: 960px">
  <h1>Waterfall Virtualizer</h1>
  <p style="color: #64748b">
    Masonry layout with {ITEM_COUNT.toLocaleString()} variable-height cards across {virtualizer.getWaterfallState()
      .columnCount} columns.
  </p>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    bind:this={scrollEl}
    onscroll={virtualizer.handleScroll}
    role="region"
    tabindex="0"
    aria-label="Virtualized waterfall"
    style="height: 560px; width: 100%; overflow: auto; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 16px; position: relative;"
  >
    <div style={`height: ${virtualizer.getTotalSize()}px; width: 100%; position: relative`}>
      {#each virtualizer.getVirtualItems() as virtualItem (items[virtualItem.index]?.id)}
        {@const item = items[virtualItem.index]}
        {@const lane = virtualItem.lane ?? 0}
        {@const layout = virtualizer.getWaterfallState()}
        {@const left = layout.columns[lane]?.offset ?? 0}
        <div
          data-index={virtualItem.index}
          style={`position: absolute; top: 0; left: 0; transform: translate3d(${left}px, ${virtualItem.start}px, 0); width: ${layout.columnWidth}px; height: ${item?.height}px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; box-sizing: border-box; background: linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%);`}
        >
          <strong style="font-size: 13px">{item?.title}</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b">{item?.subtitle} · {item?.height}px</p>
        </div>
      {/each}
    </div>
  </div>
</main>
