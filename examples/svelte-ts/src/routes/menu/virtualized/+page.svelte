<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const items = Array.from({ length: 1000 }, (_, index) => ({ value: `item-${index}`, label: `Item ${index}` }))

  const collection = menu.collection({ items })

  let selected = $state("-")

  const id = $props.id()
  const vz = useListVirtualizer({
    id,
    count: items.length,
    itemSize: 32,
    observeScrollElementSize: true,
  })

  const service = useMachine(menu.machine, {
    id,
    collection,
    scrollToIndexFn(details) {
      vz.virtualizer.scrollToIndex(details.index)
    },
    onSelect: ({ value }) => {
      selected = value
    },
  })

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>
    Pick an item <span {...api.getIndicatorProps()}>▾</span>
  </button>
  <p>Selected: <output aria-label="Selected item">{selected}</output></p>
  {#if api.open}
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div
            {...mergeProps(vz.virtualizer.getRootProps(), api.getListProps(), { style: "max-height: 320px" })}
            {@attach vz.init}
          >
            <div {...vz.virtualizer.getContentProps()}>
              {#each vz.virtualizer.getVirtualItems() as virtualItem (items[virtualItem.index].value)}
                {@const item = items[virtualItem.index]}
                <div {...mergeProps(vz.virtualizer.getItemProps(virtualItem), api.getItemProps({ value: item.value }))}>
                  {item.label}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  {/if}
</main>
