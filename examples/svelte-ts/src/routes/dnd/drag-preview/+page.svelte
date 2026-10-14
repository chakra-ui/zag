<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-list.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const initialItems = [
    { id: "1", label: "Apple", emoji: "🍎" },
    { id: "2", label: "Banana", emoji: "🍌" },
    { id: "3", label: "Cherry", emoji: "🍒" },
    { id: "4", label: "Date", emoji: "🌴" },
    { id: "5", label: "Elderberry", emoji: "🫐" },
  ]

  const id = $props.id()
  let items = $state(initialItems)
  const itemMap = $derived(new Map(items.map((i) => [i.id, i])))

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (i) => i.id })
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
  const draggedItem = $derived(api.dragSource ? itemMap.get(api.dragSource) : null)
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Drag Overlay</h3>
    <ul class={styles.items}>
      {#each items as item (item.id)}
        <li class={styles.item}>
          <div
            {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
            class={styles.dropIndicator}
          ></div>
          <div
            {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
              class: `${styles.draggable} ${styles.dropTarget}`,
            })}
          >
            <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
              <GripVerticalIcon size={14} />
            </span>
            <span>{item.emoji}</span>
            {item.label}
          </div>
          <div
            {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
            class={styles.dropIndicator}
          ></div>
        </li>
      {/each}
    </ul>
    {#if api.isDragging && draggedItem}
      <div {...api.getDragPreviewProps()} class={styles.dragPreview}>{draggedItem.emoji} {draggedItem.label}</div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
