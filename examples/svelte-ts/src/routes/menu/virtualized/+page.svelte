<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const items = Array.from({ length: 1000 }, (_, index) => ({ value: `item-${index}`, label: `Item ${index}` }))

  const collection = menu.collection({ items })

  const estimateSize = () => 32

  let selected = $state("-")

  const { virtualizer, init } = useListVirtualizer({
    count: items.length,
    estimatedSize: estimateSize,
    observeScrollElementSize: true,
  })

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index)
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
        <div
          {...api.getContentProps()}
          {@attach init}
          onscroll={virtualizer.handleScroll}
          style="max-height: 320px; overflow-y: auto"
        >
          <div style:height="{virtualizer.getTotalSize()}px" style:position="relative">
            {#each virtualizer.getVirtualItems() as virtualItem (items[virtualItem.index].value)}
              {@const item = items[virtualItem.index]}
              <div
                {...mergeProps(api.getItemProps({ value: item.value }), {
                  style: virtualizer.getItemStyle(virtualItem),
                })}
              >
                {item.label}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </Portal>
  {/if}
</main>
