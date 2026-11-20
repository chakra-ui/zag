<script lang="ts">
  import { useWaterfallVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

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

  const id = $props.id()
  const vz = useWaterfallVirtualizer({
    id,
    count: ITEM_COUNT,
    columnCount: 3,
    columnGap: 12,
    rowGap: 12,
    overscan: 6,
    estimatedItemSize: (index: number) => getItemHeight(index),
  })
</script>

<main style="padding: 20px; width: 100%; max-width: 960px">
  <h1>Waterfall Virtualizer</h1>
  <p style="color: #64748b">
    Masonry layout with {ITEM_COUNT.toLocaleString()} variable-height cards across {vz.virtualizer.getWaterfallState()
      .columnCount} columns.
  </p>

  <div
    {@attach vz.init}
    aria-label="Virtualized waterfall"
    {...mergeProps(vz.virtualizer.getRootProps(), {
      style: {
        height: "560px",
        width: "100%",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        marginTop: "16px",
      },
    })}
  >
    <div {...vz.virtualizer.getContentProps()}>
      {#each vz.virtualizer.getVirtualItems() as virtualItem (items[virtualItem.index]?.id)}
        {@const item = items[virtualItem.index]}
        <div
          {...mergeProps(vz.virtualizer.getItemProps(virtualItem), {
            style: {
              height: `${item?.height}px`,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxSizing: "border-box",
              background:
                "linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)",
            },
          })}
        >
          <strong style="font-size: 13px">{item?.title}</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b">{item?.subtitle} · {item?.height}px</p>
        </div>
      {/each}
    </div>
  </div>
</main>
