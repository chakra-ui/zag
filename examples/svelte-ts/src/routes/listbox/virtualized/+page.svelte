<script module lang="ts">
  import * as listbox from "@zag-js/listbox"

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
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import "@styles/listbox.css"

  const id = $props.id()
  const vz = useListVirtualizer({
    id,
    count: items.length,
    itemSize: 32,
    overscan: 12,
  })

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id,
    scrollToIndexFn(details) {
      vz.virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = $derived(listbox.connect(service, normalizeProps))
  const virtualItems = $derived(vz.virtualizer.getVirtualItems())
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getContentProps()}>
      <div {@attach vz.init} {...mergeProps(vz.virtualizer.getRootProps(), api.getListProps())}>
        <div {...vz.virtualizer.getContentProps()}>
          {#each virtualItems as virtualItem (items[virtualItem.index].value)}
            {@const item = items[virtualItem.index]}
            <div {...mergeProps(vz.virtualizer.getItemProps(virtualItem), api.getItemProps({ item }))}>
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
              <span {...api.getItemIndicatorProps({ item })}>✓</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
