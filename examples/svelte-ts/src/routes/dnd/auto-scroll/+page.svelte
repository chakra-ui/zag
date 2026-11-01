<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-list.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const initialItems = Array.from({ length: 30 }, (_, i) => ({
    id: String(i + 1),
    label: `Item ${i + 1}`,
  }))

  const id = $props.id()
  let items = $state(initialItems)

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    scrollThreshold: 30,
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (i) => i.id })
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Auto-Scroll (30 items in scrollable container)</h3>
    <ul class={`${styles.items} ${styles.scrollList}`}>
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
