import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const initialItems = [
  { id: "1", label: "Apple", emoji: "🍎" },
  { id: "2", label: "Banana", emoji: "🍌" },
  { id: "3", label: "Cherry", emoji: "🍒" },
  { id: "4", label: "Date", emoji: "🌴" },
  { id: "5", label: "Elderberry", emoji: "🫐" },
]

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)
  const draggedItem = api.dragSource ? itemMap.get(api.dragSource) : null

  return (
    <>
      <main className="dnd">
        <div {...api.getRootProps()}>
          <h3>Drag Overlay</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ position: "relative" }}>
                <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
                <div
                  {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }))}
                >
                  <span {...api.getDragHandleProps({ value: item.id })}>
                    <GripVerticalIcon size={14} />
                  </span>
                  <span>{item.emoji}</span>
                  {item.label}
                </div>
                <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
              </li>
            ))}
          </ul>

          {api.isDragging && draggedItem && (
            <div {...api.getDragPreviewProps()}>
              {draggedItem.emoji} {draggedItem.label}
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
