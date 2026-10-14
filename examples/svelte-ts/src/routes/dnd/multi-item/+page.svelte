<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-list.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const initialItems = [
    { id: "1", label: "Apple" },
    { id: "2", label: "Banana" },
    { id: "3", label: "Cherry" },
    { id: "4", label: "Date" },
    { id: "5", label: "Elderberry" },
    { id: "6", label: "Fig" },
  ]

  const id = $props.id()
  let items = $state(initialItems)
  let selectedIds = $state<string[]>([])
  const itemMap = $derived(new Map(items.map((i) => [i.id, i])))

  const toggleSelect = (id: string) => {
    selectedIds = selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]
  }

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    selectedValues: selectedIds,
    getValueText: (value) => itemMap.get(value)?.label ?? value,
    onDrop(details) {
      items = dnd.reorder(items, { ...details, source: details.values, itemToValue: (i) => i.id })
      selectedIds = []
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Multi-Item Drag</h3>
    <p class={styles.helperText}>
      Click items to select, then drag any selected item.
      {#if selectedIds.length > 0}
        <strong>({selectedIds.length} selected)</strong>
      {/if}
    </p>
    <ul class={styles.items}>
      {#each items as item (item.id)}
        {@const isSelected = selectedIds.includes(item.id)}
        <li class={styles.item}>
          <div
            {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
            class={styles.dropIndicator}
          ></div>
          <div
            {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
              class: `${styles.draggable} ${styles.dropTarget}`,
            })}
            data-selected={isSelected ? "" : undefined}
            onclick={() => toggleSelect(item.id)}
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
        </li>
      {/each}
    </ul>
    {#if api.isDragging && api.dragValues.length > 1}
      <div {...api.getDragPreviewProps()} class={styles.dragPreview}>{api.dragValues.length} items</div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
