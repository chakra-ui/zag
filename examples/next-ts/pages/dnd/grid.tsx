import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const COLUMN_COUNT = 3

const initialItems = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
  color: ["#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#e5e7eb", "#fde68a"][i],
}))

export default function Page() {
  const [items, setItems] = useState(initialItems)

  const service = useMachine(dnd.machine, {
    id: useId(),
    columnCount: COLUMN_COUNT,
    collisionStrategy: dnd.closestCenter,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className="dnd">
        <div {...api.getRootProps()}>
          <h3>Grid Layout ({COLUMN_COUNT} columns)</h3>
          <div className="dnd-grid">
            {items.map((item) => (
              <div key={item.id} style={{ position: "relative" }}>
                <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
                <div
                  {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }))}
                  style={{
                    padding: "16px 12px",
                    borderRadius: 8,
                    background: item.color,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid transparent",
                  }}
                >
                  <span {...api.getDragHandleProps({ value: item.id })}>
                    <GripVerticalIcon size={14} />
                  </span>
                  {item.label}
                </div>
                <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
