<script lang="ts">
  import { useWindowVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

  const generateItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Item ${i + 1}`,
      description: `This is the description for item ${i + 1}`,
    }))

  const items = generateItems(10000)

  const id = $props.id()
  const vz = useWindowVirtualizer({
    id,
    count: items.length,
    estimatedItemSize: 142,
    overscan: 8,
    gap: 0,
    paddingStart: 0,
    paddingEnd: 0,
    initialRect:
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 0, height: 800 },
  })

  const virtualItems = $derived(vz.virtualizer.getVirtualItems())
  const totalSize = $derived(vz.virtualizer.getTotalSize())
</script>

<main class="window-list-virtualizer" style="max-width: 960px; margin: 0 auto; padding: 20px 20px 80px">
  <h1>Window virtualizer</h1>
  <p style="color: #4b5563; line-height: 1.6">
    <code>WindowVirtualizer</code> delegates scrolling to the nearest scrollable ancestor (or <code>window</code>). No
    <code>onScroll</code> handler is needed on the virtualizer root. Smooth <code>scrollToIndex</code> uses native
    <code>behavior: "smooth"</code> on the real scroll target.
  </p>

  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px">
    <button type="button" onclick={() => vz.virtualizer.scrollToIndex(0, { smooth: true })}>Scroll to top</button>
    <button
      type="button"
      onclick={() => vz.virtualizer.scrollToIndex(Math.floor(items.length / 2), { align: "center", smooth: true })}
    >
      Scroll to middle
    </button>
    <button type="button" onclick={() => vz.virtualizer.scrollToIndex(items.length - 1, { smooth: true })}>
      Scroll to bottom
    </button>
  </div>

  <div
    {@attach vz.init}
    {...mergeProps(vz.virtualizer.getRootProps(), {
      style: { width: "100%", marginTop: "20px", border: "1px solid #d1d5db", borderRadius: "8px" },
    })}
  >
    <div {...vz.virtualizer.getContentProps()}>
      {#each virtualItems as virtualItem (virtualItem.key)}
        <div
          {...mergeProps(vz.virtualizer.getItemProps(virtualItem), {
            style: {
              padding: "16px",
              backgroundColor: virtualItem.index % 2 === 0 ? "#f8f9fa" : "#ffffff",
              borderBottom: "1px solid #e1e5e9",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            },
          })}
        >
          <div
            style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; color: #1a1a1a"
          >
            {items[virtualItem.index].name}
          </div>
          <p style="margin: 0">{items[virtualItem.index].description}</p>
          <div style="font-size: 12px; color: #9ca3af; font-family: monospace">
            Virtual index: {virtualItem.index} | Start: {virtualItem.start}px | Size: {virtualItem.size}px
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div style="margin-top: 16px; font-size: 14px; color: #6b7280">
    <div>Total items: {items.length.toLocaleString()}</div>
    <div>Rendered rows: {virtualItems.length}</div>
    <div>Total height: {totalSize}px</div>
    <div>Visible range: {virtualItems[0]?.index ?? 0} — {virtualItems[virtualItems.length - 1]?.index ?? 0}</div>
  </div>
</main>
