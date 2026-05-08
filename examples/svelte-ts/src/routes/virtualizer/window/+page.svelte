<script lang="ts">
  import { useWindowVirtualizer } from "$lib/use-virtualizer.svelte"

  const ITEM_COUNT = 10_000
  const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index + 1}`,
  }))

  let rootEl = $state<HTMLDivElement | null>(null)

  const store = useWindowVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => 72,
    overscan: 8,
    initialRect:
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 0, height: 800 },
  })

  $effect(() => {
    store.init(rootEl)
  })
</script>

<main style="padding: 20px; width: 100%; max-width: 960px">
  <h1>Window Virtualizer</h1>
  <p style="color: #64748b">Uses the page scroll container instead of an explicit scrolling element.</p>

  <div
    bind:this={rootEl}
    {...store.virtualizer.getContainerAriaAttrs()}
    style="width: 100%; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 16px; position: relative;"
  >
    <div style={`height: ${store.totalSize}px; width: 100%; position: relative`}>
      {#each store.items as virtualItem (items[virtualItem.index]?.id)}
        <div
          style={`position: absolute; left: 0; width: 100%; transform: translateY(${virtualItem.start}px); height: ${virtualItem.size}px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: ${virtualItem.index % 2 === 0 ? "#f8fafc" : "#fff"}; box-sizing: border-box;`}
        >
          {items[virtualItem.index]?.name}
        </div>
      {/each}
    </div>
  </div>
</main>
