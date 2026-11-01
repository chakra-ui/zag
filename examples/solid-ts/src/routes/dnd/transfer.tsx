import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

interface Item {
  id: string
  label: string
}

const fruitsData: Item[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
  { id: "date", label: "Date" },
]

const veggiesData: Item[] = [
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

export default function Page() {
  const [fruits, setFruits] = createSignal(fruitsData)
  const [veggies, setVeggies] = createSignal(veggiesData)

  const itemMap = createMemo(() => {
    const map = new Map<string, Item>()
    for (const i of fruits()) map.set(i.id, i)
    for (const i of veggies()) map.set(i.id, i)
    return map
  })

  const fruitIds = createMemo(() => new Set(fruits().map((i) => i.id)))

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    getValueText: (value) => itemMap().get(value)?.label ?? value,
    onDrop({ source, target, placement }) {
      if (placement === "on") return

      const sourceItem = itemMap().get(source)
      if (!sourceItem) return

      const fromFruits = fruitIds().has(source)
      const toFruits = fruitIds().has(target)

      if (fromFruits && toFruits) {
        setFruits((prev) => {
          const fromIndex = prev.findIndex((i) => i.id === source)
          const toIndex = prev.findIndex((i) => i.id === target)
          return dnd.move(prev, fromIndex, dnd.getDestinationIndex(prev.length, fromIndex, toIndex, placement))
        })
      } else if (!fromFruits && !toFruits) {
        setVeggies((prev) => {
          const fromIndex = prev.findIndex((i) => i.id === source)
          const toIndex = prev.findIndex((i) => i.id === target)
          return dnd.move(prev, fromIndex, dnd.getDestinationIndex(prev.length, fromIndex, toIndex, placement))
        })
      } else if (fromFruits && !toFruits) {
        setFruits((prev) => prev.filter((i) => i.id !== source))
        setVeggies((prev) => insertAt(prev, target, placement, sourceItem))
      } else {
        setVeggies((prev) => prev.filter((i) => i.id !== source))
        setFruits((prev) => insertAt(prev, target, placement, sourceItem))
      }
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  const renderItem = (item: Item) => (
    <li class={styles.item}>
      <div {...api().getDropIndicatorProps({ value: item.id, placement: "before" })} class={styles.dropIndicator} />
      <div
        {...mergeProps(api().getDraggableProps({ value: item.id }), api().getDropTargetProps({ value: item.id }), {
          class: `${styles.draggable} ${styles.dropTarget}`,
        })}
      >
        <span {...api().getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
          <GripVertical size={14} />
        </span>
        {item.label}
      </div>
      <div {...api().getDropIndicatorProps({ value: item.id, placement: "after" })} class={styles.dropIndicator} />
    </li>
  )

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Multi-Container Transfer</h3>
          <div class={styles.transferLayout}>
            <div class={styles.transferColumn}>
              <h4>Fruits ({fruits().length})</h4>
              <ul class={styles.transferList}>
                <For each={fruits()}>{renderItem}</For>
              </ul>
            </div>
            <div class={styles.transferColumn}>
              <h4>Veggies ({veggies().length})</h4>
              <ul class={styles.transferList}>
                <For each={veggies()}>{renderItem}</For>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
