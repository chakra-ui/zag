<script lang="ts">
  import { useListVirtualizer } from "$lib/use-virtualizer.svelte"

  const ITEM_COUNT = 10_000
  const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index + 1}`,
    description: `This is the description for item ${index + 1}`,
  }))

  let smoothScroll = $state(true)
  let scrollEl = $state<HTMLDivElement | null>(null)

  const { virtualizer, init } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => 64,
    overscan: 6,
  })

  $effect(() => {
    init(scrollEl)
  })
</script>

<main style="padding: 20px; width: 100%; max-width: 900px">
  <h1>List Virtualizer</h1>
  <p style="color: #64748b">Efficiently render {ITEM_COUNT.toLocaleString()} rows.</p>

  <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; user-select: none">
    <input type="checkbox" bind:checked={smoothScroll} />
    Smooth scroll
  </label>

  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px">
    <button type="button" onclick={() => virtualizer.scrollToIndex(0, { smooth: smoothScroll })}>Scroll to top</button>
    <button type="button" onclick={() => virtualizer.scrollToIndex(Math.floor(ITEM_COUNT / 2), { align: "center", smooth: smoothScroll })}>
      Scroll to middle
    </button>
    <button type="button" onclick={() => virtualizer.scrollToIndex(ITEM_COUNT - 1, { smooth: smoothScroll })}>Scroll to bottom</button>
  </div>

  <div
    bind:this={scrollEl}
    onscroll={virtualizer.handleScroll}
    role="listbox"
    tabindex="0"
    aria-label="Virtualized list"
    style="height: 420px; width: 100%; overflow: auto; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 16px; position: relative;"
  >
    <div style={`height: ${virtualizer.getTotalSize()}px; width: 100%; position: relative`}>
      {#each virtualizer.getVirtualItems() as virtualItem (items[virtualItem.index]?.id)}
        <div
          data-index={virtualItem.index}
          {...virtualizer.getItemAriaAttrs(virtualItem.index)}
          style={`position: absolute; left: 0; width: 100%; transform: translateY(${virtualItem.start}px); height: ${virtualItem.size}px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: ${virtualItem.index % 2 === 0 ? "#f8fafc" : "#fff"}; box-sizing: border-box;`}
        >
          <strong>{items[virtualItem.index]?.name}</strong>
          <p style="margin: 6px 0 0; color: #64748b">{items[virtualItem.index]?.description}</p>
        </div>
      {/each}
    </div>
  </div>
</main>
