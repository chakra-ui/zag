<script module lang="ts">
  import * as listbox from "@zag-js/listbox"

  const estimateSize = () => 28

  const items = new Array(10000).fill(0).map((_, index) => ({
    label: `Item ${index}`,
    value: `item-${index}`,
  }))

  const collection = listbox.collection({ items })

  interface Item {
    label: string
    value: string
  }
</script>

<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { useListVirtualizer } from "$lib/use-virtualizer.svelte"
  import "@styles/listbox.css"

  const { virtualizer, init } = useListVirtualizer({
    count: items.length,
    estimatedSize: estimateSize,
    overscan: 12,
  })

  const id = $props.id()
  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = $derived(listbox.connect(service, normalizeProps))
  const virtualItems = $derived(virtualizer.getVirtualItems())
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getContentProps()}>
      <div {@attach init} {...api.getListProps()} onscroll={virtualizer.handleScroll}>
        <div style="width: 100%; position: relative" style:height="{virtualizer.getTotalSize()}px">
          {#each virtualItems as virtualItem (items[virtualItem.index].value)}
            {@const item = items[virtualItem.index]}
            <div
              {...api.getItemProps({ item })}
              data-index={virtualItem.index}
              aria-setsize={items.length}
              aria-posinset={virtualItem.index + 1}
              {...normalizeProps.element({
                style: { ...virtualizer.getItemStyle(virtualItem), overflowAnchor: "none" },
              })}
            >
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
              <span {...api.getItemIndicatorProps({ item })}>✓</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
