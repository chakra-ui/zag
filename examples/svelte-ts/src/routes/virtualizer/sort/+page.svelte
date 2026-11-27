<script lang="ts">
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

  interface Row {
    id: number
    height: number
  }

  // heights come from the data, so the list's true size is known
  const rows: Row[] = Array.from({ length: 2000 }, (_, id) => ({ id, height: 30 + ((id * 37) % 7) * 20 }))

  let items = $state(rows)
  let target = $state(1000)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: items.length,
    estimatedItemSize: 48,
    overscan: 4,
    indexToKey: (index: number) => items[index].id,
  }))

  const sortBy = (compare: (a: Row, b: Row) => number) => (items = [...items].sort(compare))
  const trueSize = $derived(items.reduce((sum, row) => sum + row.height, 0))
</script>

<main style="padding: 20px">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <button onclick={() => sortBy((a, b) => a.height - b.height || a.id - b.id)}>Sort by height</button>
    <button onclick={() => sortBy((a, b) => a.id - b.id)}>Sort by id</button>
    <button onclick={() => (items = [...items].reverse())}>Reverse</button>
    <label style="display: flex; align-items: center; gap: 6px">
      Row
      <input type="number" bind:value={target} min={0} max={items.length - 1} style="width: 80px" />
    </label>
    <button onclick={() => vz.virtualizer.scrollToIndex(target, { align: "start" })}>Scroll to row</button>
  </div>
  <div
    {@attach vz.init}
    {...mergeProps(vz.virtualizer.getRootProps(), {
      style: { height: "400px", width: "360px", border: "1px solid #ccc", marginTop: "12px" },
    })}
    aria-label="Rows"
  >
    <div {...vz.virtualizer.getContentProps()}>
      {#each vz.virtualizer.getVirtualItems() as item (item.key)}
        {@const row = items[item.index]}
        <div {...vz.virtualizer.getItemProps(item)} data-testid="row">
          <div
            style="height: {row.height}px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid #e5e7eb; background: hsl({200 +
              row.height}, 70%, 97%); box-sizing: border-box; font-size: 13px"
          >
            <strong>#{row.id}</strong>
            <span style="color: #6b7280">{row.height}px tall</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <p style="margin: 12px 0 4px; font-size: 13px; color: #6b7280">
    The virtualizer's size against the true size. Rows not yet measured use the estimate.
  </p>
  <pre>{JSON.stringify({ totalSize: vz.virtualizer.getTotalSize(), trueSize })}</pre>
</main>
