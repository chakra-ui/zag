<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-variable-size.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const initialItems = [
    {
      id: "scope",
      title: "Define scope",
      description: "Short item.",
    },
    {
      id: "audit",
      title: "Audit current behavior",
      description:
        "Review pointer collision, keyboard movement, auto-scroll, and drag preview behavior across list and grid examples.",
    },
    {
      id: "prototype",
      title: "Prototype changes",
      description:
        "Build a small example that intentionally mixes compact rows with taller rows so before and after placement can be checked near uneven item boundaries.",
    },
    {
      id: "docs",
      title: "Update notes",
      description: "Capture the recommendation and remaining risks.",
    },
    {
      id: "qa",
      title: "Run checks",
      description:
        "Validate with pointer dragging from the top, middle, and bottom of each row. Include slow diagonal movement across item gaps.",
    },
    {
      id: "ship",
      title: "Ship",
      description: "Prepare the final patch once the behavior is predictable.",
    },
  ]

  const id = $props.id()
  let items = $state(initialItems)

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (item) => item.id })
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
  const draggedItem = $derived(items.find((item) => item.id === api.dragSource))
  const dragPreviewProps = $derived(api.getDragPreviewProps())
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Variable Size List</h3>
    <ul class={styles.items}>
      {#each items as item (item.id)}
        <li class={styles.item}>
          <div
            {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
            class={styles.dropIndicator}
          ></div>
          <div
            {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
              class: styles.draggable,
            })}
          >
            <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
              <GripVerticalIcon size={14} />
            </span>
            <span class={styles.content}>
              <span class={styles.title}>{item.title}</span>
              <span class={styles.description}>{item.description}</span>
            </span>
          </div>
          <div
            {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
            class={styles.dropIndicator}
          ></div>
        </li>
      {/each}
    </ul>
    {#if api.isDragging && draggedItem}
      <div {...dragPreviewProps} class={`${styles.draggable} ${styles.dragPreview}`}>
        <span class={styles.dragHandle}>
          <GripVerticalIcon size={14} />
        </span>
        <span class={styles.content}>
          <span class={styles.title}>{draggedItem.title}</span>
          <span class={styles.description}>{draggedItem.description}</span>
        </span>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
