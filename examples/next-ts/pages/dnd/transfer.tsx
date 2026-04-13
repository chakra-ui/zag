import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

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

export default function Page() {
  const [fruits, setFruits] = useState(fruitsData)
  const [veggies, setVeggies] = useState(veggiesData)

  const itemMap = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>()
    for (const i of fruits) map.set(i.id, i)
    for (const i of veggies) map.set(i.id, i)
    return map
  }, [fruits, veggies])

  const fruitIds = useMemo(() => new Set(fruits.map((i) => i.id)), [fruits])

  const service = useMachine(dnd.machine, {
    id: useId(),
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
        setFruits((prev) => {
          const fromIndex = prev.findIndex((i) => i.id === source)
          const toIndex = prev.findIndex((i) => i.id === target)
          return dnd.move(prev, fromIndex, dnd.getDestinationIndex(prev.length, fromIndex, toIndex, placement))
        })
      } else if (!fromFruits && !toFruits) {
        // Reorder within veggies
        setVeggies((prev) => {
          const fromIndex = prev.findIndex((i) => i.id === source)
          const toIndex = prev.findIndex((i) => i.id === target)
          return dnd.move(prev, fromIndex, dnd.getDestinationIndex(prev.length, fromIndex, toIndex, placement))
        })
      } else if (fromFruits && !toFruits) {
        // Transfer fruits → veggies
        setFruits((prev) => prev.filter((i) => i.id !== source))
        setVeggies((prev) => insertAt(prev, target, placement, sourceItem))
      } else {
        // Transfer veggies → fruits
        setVeggies((prev) => prev.filter((i) => i.id !== source))
        setFruits((prev) => insertAt(prev, target, placement, sourceItem))
      }
    },
  })
  const api = dnd.connect(service, normalizeProps)

  const renderItem = (item: { id: string; label: string }) => (
    <li key={item.id} style={{ position: "relative" }}>
      <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
      <div {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }))}>
        <span {...api.getDragHandleProps({ value: item.id })}>
          <GripVerticalIcon size={14} />
        </span>
        {item.label}
      </div>
      <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
    </li>
  )

  return (
    <>
      <main className="dnd">
        <div {...api.getRootProps()}>
          <h3>Multi-Container Transfer</h3>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h4>Fruits ({fruits.length})</h4>
              <ul style={{ listStyle: "none", padding: 0, minHeight: 60 }}>{fruits.map(renderItem)}</ul>
            </div>
            <div style={{ flex: 1 }}>
              <h4>Veggies ({veggies.length})</h4>
              <ul style={{ listStyle: "none", padding: 0, minHeight: 60 }}>{veggies.map(renderItem)}</ul>
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
