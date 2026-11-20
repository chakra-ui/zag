<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as dnd from "@zag-js/dnd"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { GripVerticalIcon } from "lucide-svelte"
  import styles from "@styles/dnd-list.module.css"

  const initialItems = Array.from({ length: 500 }, (_, i) => ({
    id: String(i + 1),
    label: `Item ${i + 1}`,
  }))

  let items = $state(initialItems)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: items.length,
    itemSize: 40,
    overscan: 10,
    aria: false,
  }))

  const service = useMachine(dnd.machine, {
    id,
    orientation: "vertical",
    scrollThreshold: 30,
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (i) => i.id })
    },
  })
  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Virtualized (500 items)</h3>
    <div {@attach vz.init} {...vz.virtualizer.getRootProps()} class={styles.virtualViewport}>
      <div {...vz.virtualizer.getContentProps()} class={styles.virtualSizer}>
        {#each vz.virtualizer.getVirtualItems() as vi (items[vi.index]?.id ?? vi.index)}
          {@const item = items[vi.index]}
          {#if item}
            <div {...vz.virtualizer.getItemProps(vi)}>
              <div class={styles.virtualRowInner}>
                <div
                  {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
                  class={styles.dropIndicator}
                ></div>
                <div
                  {...mergeProps(
                    api.getDraggableProps({ value: item.id }),
                    api.getDropTargetProps({ value: item.id }),
                    { class: `${styles.draggable} ${styles.dropTarget}` },
                  )}
                >
                  <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                    <GripVerticalIcon size={14} />
                  </span>
                  {item.label}
                </div>
                <div
                  {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
                  class={styles.dropIndicator}
                ></div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
