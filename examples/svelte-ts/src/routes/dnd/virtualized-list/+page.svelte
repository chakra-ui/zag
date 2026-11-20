<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as dnd from "@zag-js/dnd"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import styles from "@styles/dnd-virtualized-list.module.css"
  import { GripVerticalIcon } from "lucide-svelte"

  const initialItems = Array.from({ length: 500 }, (_, index) => ({
    id: String(index + 1),
    label: `Item ${index + 1}`,
  }))

  let items = $state(initialItems)
  let lastDrop = $state<string | null>(null)
  let scrollTop = $state(0)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: items.length,
    itemSize: 44,
    overscan: 8,
    aria: false,
  }))

  const service = useMachine(dnd.machine, {
    id,
    orientation: "vertical",
    scrollThreshold: 36,
    onDrop(details) {
      lastDrop = `${details.source} -> ${details.target} ${details.placement}`
      items = dnd.reorder(items, { ...details, itemToValue: (item) => item.id })
    },
  })
  const api = $derived(dnd.connect(service, normalizeProps))
  const range = $derived(vz.virtualizer.getRange())
  const draggedItem = $derived(items.find((item) => item.id === api.dragSource))
  const dragPreviewProps = $derived(api.getDragPreviewProps())

  const onScroll = (event: Event) => {
    scrollTop = (event.currentTarget as HTMLElement).scrollTop
  }
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Virtualized List</h3>

    <div class={styles.toolbar}>
      <span class={styles.stat}>mounted {range.startIndex + 1}-{range.endIndex + 1}</span>
      <span class={styles.stat}>scroll {Math.round(scrollTop)}</span>
      <span class={styles.stat}>over {api.dropTarget ? `${api.dropTarget} ${api.dropPlacement}` : "none"}</span>
      <span class={styles.stat}>drop {lastDrop ?? "none"}</span>
    </div>

    <div {@attach vz.init} {...vz.virtualizer.getRootProps()} onscroll={onScroll} class={styles.viewport}>
      <div {...vz.virtualizer.getContentProps()} class={styles.sizer}>
        {#each vz.virtualizer.getVirtualItems() as virtualItem (items[virtualItem.index]?.id ?? virtualItem.index)}
          {@const item = items[virtualItem.index]}
          {#if item}
            <div {...vz.virtualizer.getItemProps(virtualItem)}>
              <div class={styles.row}>
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

    {#if api.isDragging && draggedItem}
      <div {...dragPreviewProps} class={`${styles.draggable} ${styles.dragPreview}`}>
        <span class={styles.dragHandle}>
          <GripVerticalIcon size={14} />
        </span>
        {draggedItem.label}
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
