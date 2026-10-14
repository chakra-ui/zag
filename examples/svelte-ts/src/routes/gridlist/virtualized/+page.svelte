<script module lang="ts">
  interface Row {
    id: string
    index: number
    name: string
  }

  const ROW_HEIGHT = 44
  const ROW_COUNT = 10000

  const estimateSize = () => ROW_HEIGHT

  const items: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({
    id: `row-${i}`,
    index: i,
    name: `Row ${i + 1}`,
  }))
</script>

<script lang="ts">
  import * as gridlist from "@zag-js/gridlist"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon } from "lucide-svelte"
  import { useListVirtualizer } from "$lib/use-virtualizer.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import "@styles/gridlist.css"

  const collection = gridlist.collection<Row>({
    items,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const { virtualizer, init } = useListVirtualizer({
    count: items.length,
    estimatedSize: estimateSize,
    overscan: 8,
  })

  const id = $props.id()
  const service = useMachine(gridlist.machine as gridlist.Machine<Row>, {
    id,
    collection,
    selectionMode: "multiple",
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = $derived(gridlist.connect(service, normalizeProps))
  const virtualItems = $derived(virtualizer.getVirtualItems())
</script>

<main>
  <div class="gridlist">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>10,000 rows</label>
      <div
        {@attach init}
        {...mergeProps(api.getContentProps(), { style: { height: "360px", width: "480px" } })}
        tabindex={0}
        onscroll={virtualizer.handleScroll}
      >
        <div style="width: 100%; position: relative" style:height="{virtualizer.getTotalSize()}px">
          {#each virtualItems as vi (items[vi.index].id)}
            {@const item = items[vi.index]}
            <div
              {...api.getItemProps({ item })}
              data-index={vi.index}
              {...normalizeProps.element({ style: { ...virtualizer.getItemStyle(vi), overflowAnchor: "none" } })}
            >
              <div {...api.getCellProps()}>
                {#if api.hasCheckbox}
                  <button {...api.getItemCheckboxProps({ item })}>
                    <CheckIcon {...api.getItemIndicatorProps({ item }) as Record<string, unknown>} />
                  </button>
                {/if}
                <div class="gridlist-item-body">
                  <span {...api.getItemTextProps({ item })} class="gridlist-item-title">
                    {item.name}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #52525b">
      Selected: <strong>{api.value.length}</strong> · Rendered: {virtualItems.length} of {items.length}
    </p>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["focusedValue", "value"]} />
</Toolbar>
