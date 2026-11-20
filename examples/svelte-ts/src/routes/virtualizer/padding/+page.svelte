<script lang="ts">
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

  const ITEM_COUNT = 1000

  const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i + 1}`,
  }))

  let paddingStart = $state(40)
  let paddingEnd = $state(40)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: ITEM_COUNT,
    itemSize: 40,
    paddingStart,
    paddingEnd,
    overscan: 5,
  }))

  const updatePadding = (start: number, end: number) => {
    paddingStart = start
    paddingEnd = end
  }
</script>

<main style="padding: 20px; max-width: 600px; width: 100%">
  <h1>Padding Example</h1>
  <p style="color: #64748b">
    <code>paddingStart</code> and <code>paddingEnd</code> add space before/after items. The blue regions show the padding
    areas.
  </p>

  <div style="display: flex; gap: 12px; margin-top: 16px; align-items: center">
    <label>
      paddingStart:
      <input
        type="number"
        value={paddingStart}
        style="width: 60px"
        oninput={(e) => updatePadding(Number(e.currentTarget.value), paddingEnd)}
      />px
    </label>
    <label>
      paddingEnd:
      <input
        type="number"
        value={paddingEnd}
        style="width: 60px"
        oninput={(e) => updatePadding(paddingStart, Number(e.currentTarget.value))}
      />px
    </label>
    <button onclick={() => updatePadding(0, 0)}>No padding</button>
    <button onclick={() => updatePadding(80, 80)}>Large padding</button>
  </div>

  <div
    {@attach vz.init}
    aria-label="Virtualized list with padding"
    {...mergeProps(vz.virtualizer.getRootProps(), {
      style: {
        height: "400px",
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        marginTop: "16px",
        boxSizing: "border-box",
      },
    })}
  >
    <div
      {...mergeProps(vz.virtualizer.getContentProps(), {
        style: {
          background: `linear-gradient(to bottom, #dbeafe ${paddingStart}px, transparent ${paddingStart}px, transparent calc(100% - ${paddingEnd}px), #dbeafe calc(100% - ${paddingEnd}px))`,
        },
      })}
    >
      {#each vz.virtualizer.getVirtualItems() as vi (vi.key)}
        <div
          {...mergeProps(vz.virtualizer.getItemProps(vi), {
            style: {
              height: "40px",
              padding: "0 16px",
              borderBottom: "1px solid #cbd5e1",
              boxSizing: "border-box",
              backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
          })}
        >
          <span>{items[vi.index].label}</span>
          <span style="color: #94a3b8; font-size: 12px">y: {vi.start}px</span>
        </div>
      {/each}
    </div>
  </div>

  <p style="margin-top: 12px; font-size: 13px; color: #64748b">
    Total size: {vz.virtualizer.getTotalSize()}px (padding: {paddingStart} + {paddingEnd} = {paddingStart +
      paddingEnd}px)
  </p>
</main>
