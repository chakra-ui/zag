<script lang="ts">
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as dnd from "@zag-js/dnd"
  import { GripVertical } from "lucide-svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import styles from "@styles/dnd-list.module.css"

  const initialItems = [
    { id: "1", label: "Apple" },
    { id: "2", label: "Banana" },
    { id: "3", label: "Cherry" },
    { id: "4", label: "Date" },
    { id: "5", label: "Elderberry" },
  ]

  const id = $props.id()
  let items = $state(initialItems)

  const service = useMachine(dnd.machine, {
    id,
    orientation: "vertical",
    onDrop(details) {
      const { source, target, placement } = details
      if (placement === "on") return
      const fromIndex = items.findIndex((item) => item.id === source)
      const toIndex = items.findIndex((item) => item.id === target)
      if (fromIndex === -1 || toIndex === -1) return
      items = dnd.move(items, fromIndex, dnd.getDestinationIndex(items.length, fromIndex, toIndex, placement))
    },
  })

  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Sortable List</h3>
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
              <GripVertical size={14} />
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
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
