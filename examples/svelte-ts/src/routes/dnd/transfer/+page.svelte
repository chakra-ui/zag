<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-list.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const fruitsData = [
    { id: "apple", label: "Apple" },
    { id: "banana", label: "Banana" },
    { id: "cherry", label: "Cherry" },
    { id: "date", label: "Date" },
  ]

  const veggiesData = [
    { id: "asparagus", label: "Asparagus" },
    { id: "broccoli", label: "Broccoli" },
    { id: "carrot", label: "Carrot" },
  ]

  function insertAt<T extends { id: string }>(items: T[], targetId: string, placement: string, item: T): T[] {
    const idx = items.findIndex((i) => i.id === targetId)
    if (idx === -1) return [...items, item]
    const insertIdx = placement === "after" ? idx + 1 : idx
    return [...items.slice(0, insertIdx), item, ...items.slice(insertIdx)]
  }

  const id = $props.id()
  let fruits = $state(fruitsData)
  let veggies = $state(veggiesData)

  const itemMap = $derived.by(() => {
    const map = new Map<string, { id: string; label: string }>()
    for (const i of fruits) map.set(i.id, i)
    for (const i of veggies) map.set(i.id, i)
    return map
  })

  const fruitIds = $derived(new Set(fruits.map((i) => i.id)))

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    getValueText: (value) => itemMap.get(value)?.label ?? value,
    onDrop({ source, target, placement }) {
      if (placement === "on") return

      const sourceItem = itemMap.get(source)
      if (!sourceItem) return

      const fromFruits = fruitIds.has(source)
      const toFruits = fruitIds.has(target)

      if (fromFruits && toFruits) {
        // Reorder within fruits
        const fromIndex = fruits.findIndex((i) => i.id === source)
        const toIndex = fruits.findIndex((i) => i.id === target)
        fruits = dnd.move(fruits, fromIndex, dnd.getDestinationIndex(fruits.length, fromIndex, toIndex, placement))
      } else if (!fromFruits && !toFruits) {
        // Reorder within veggies
        const fromIndex = veggies.findIndex((i) => i.id === source)
        const toIndex = veggies.findIndex((i) => i.id === target)
        veggies = dnd.move(veggies, fromIndex, dnd.getDestinationIndex(veggies.length, fromIndex, toIndex, placement))
      } else if (fromFruits && !toFruits) {
        // Transfer fruits → veggies
        fruits = fruits.filter((i) => i.id !== source)
        veggies = insertAt(veggies, target, placement, sourceItem)
      } else {
        // Transfer veggies → fruits
        veggies = veggies.filter((i) => i.id !== source)
        fruits = insertAt(fruits, target, placement, sourceItem)
      }
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
</script>

{#snippet renderItem(item: { id: string; label: string })}
  <li class={styles.item}>
    <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} class={styles.dropIndicator}></div>
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
    <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} class={styles.dropIndicator}></div>
  </li>
{/snippet}

<main class={styles.main}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Multi-Container Transfer</h3>
    <div class={styles.transferLayout}>
      <div class={styles.transferColumn}>
        <h4>Fruits ({fruits.length})</h4>
        <ul class={styles.transferList}>
          {#each fruits as item (item.id)}
            {@render renderItem(item)}
          {/each}
        </ul>
      </div>
      <div class={styles.transferColumn}>
        <h4>Veggies ({veggies.length})</h4>
        <ul class={styles.transferList}>
          {#each veggies as item (item.id)}
            {@render renderItem(item)}
          {/each}
        </ul>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
