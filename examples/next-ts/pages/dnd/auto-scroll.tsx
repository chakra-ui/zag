import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const initialItems = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [items, setItems] = useState(initialItems)

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    scrollThreshold: 30,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className="dnd">
        <div {...api.getRootProps()}>
          <h3>Auto-Scroll (30 items in scrollable container)</h3>
          <ul style={{ listStyle: "none", padding: 0, maxHeight: 400, overflow: "auto" }}>
            {items.map((item) => (
              <li key={item.id} style={{ position: "relative" }}>
                <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
                <div
                  {...mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }))}
                >
                  <span {...api.getDragHandleProps({ value: item.id })}>
                    <GripVerticalIcon size={14} />
                  </span>
                  {item.label}
                </div>
                <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
