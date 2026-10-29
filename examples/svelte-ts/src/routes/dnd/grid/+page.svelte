<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-grid.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const COLUMN_COUNT = 3

  const initialItems = Array.from({ length: 9 }, (_, i) => ({
    id: String(i + 1),
    label: `Item ${i + 1}`,
    color: ["#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#e5e7eb", "#fde68a"][i],
  }))

  type GridItem = (typeof initialItems)[number]

  function getInsertionIndex(
    items: GridItem[],
    dragValues: string[],
    dropTarget: string,
    dropPlacement: dnd.DropPlacement,
  ) {
    if (dropPlacement === "on") return null

    const dragSet = new Set(dragValues)
    const remaining = items.filter((item) => !dragSet.has(item.id))
    const targetIndex = remaining.findIndex((item) => item.id === dropTarget)
    if (targetIndex === -1) return null

    return dropPlacement === "after" ? targetIndex + 1 : targetIndex
  }

  function getGridSlotEl(gridEl: HTMLElement, index: number) {
    return Array.from(gridEl.querySelectorAll<HTMLElement>("[data-dnd-draggable]"))[index]
  }

  const id = $props.id()
  let items = $state(initialItems)
  let placeholderStyle = $state<Record<string, string> | null>(null)
  let gridRef = $state<HTMLDivElement | null>(null)

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    columnCount: COLUMN_COUNT,
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (i) => i.id })
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
  const draggedItem = $derived(api.dragSource ? items.find((item) => item.id === api.dragSource) : null)
  const dragPreviewProps = $derived(api.getDragPreviewProps())

  $effect(() => {
    const gridEl = gridRef
    if (!gridEl || !api.isDragging || !api.dropTarget || !api.dropPlacement) {
      placeholderStyle = null
      return
    }

    const insertionIndex = getInsertionIndex(items, api.dragValues, api.dropTarget, api.dropPlacement)
    if (insertionIndex == null) {
      placeholderStyle = null
      return
    }

    const targetEl = getGridSlotEl(gridEl, insertionIndex)
    if (!targetEl) return

    const gridRect = gridEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    placeholderStyle = {
      top: `${targetRect.top - gridRect.top}px`,
      left: `${targetRect.left - gridRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
    }
  })
</script>

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Grid Layout ({COLUMN_COUNT} columns)</h3>
    <div bind:this={gridRef} class={styles.grid}>
      {#each items as item (item.id)}
        <div class={styles.item}>
          <div
            {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
              class: styles.draggable,
            })}
            style:--item-color={item.color}
          >
            <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
              <GripVerticalIcon size={14} />
            </span>
            {item.label}
          </div>
        </div>
      {/each}
      {#if placeholderStyle}
        <div class={styles.placeholder} {...normalizeProps.element({ style: placeholderStyle })}></div>
      {/if}
    </div>
    {#if api.isDragging && draggedItem}
      <div {...dragPreviewProps} class={styles.dragPreview} style:--item-color={draggedItem.color}>
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
