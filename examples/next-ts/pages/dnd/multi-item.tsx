import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
  { id: "6", label: "Fig" },
]

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    selectedValues: selectedIds,
    getValueText: (value) => itemMap.get(value)?.label ?? value,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, source: details.values, itemToValue: (i) => i.id }))
      setSelectedIds([])
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className="dnd">
        <div {...api.getRootProps()}>
          <h3>Multi-Item Drag</h3>
          <p style={{ fontSize: 13, color: "#71717a", marginBottom: 8 }}>
            Click items to select, then drag any selected item.
            {selectedIds.length > 0 && <strong> ({selectedIds.length} selected)</strong>}
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => {
              const itemState = api.getItemState(item.id)
              const isSelected = selectedIds.includes(item.id)
              return (
                <li key={item.id} style={{ position: "relative" }}>
                  <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
                  <div
                    {...mergeProps(
                      api.getDraggableProps({ value: item.id }),
                      api.getDropTargetProps({ value: item.id }),
                    )}
                    onClick={() => toggleSelect(item.id)}
                    style={{
                      background: isSelected ? "#dbeafe" : undefined,
                      borderColor: isSelected ? "#3b82f6" : undefined,
                      opacity: itemState.isDragging ? 0.4 : 1,
                    }}
                  >
                    <span {...api.getDragHandleProps({ value: item.id })}>
                      <GripVerticalIcon size={14} />
                    </span>
                    {item.label}
                  </div>
                  <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
                </li>
              )
            })}
          </ul>

          {api.isDragging && api.dragValues.length > 1 && (
            <div {...api.getDragPreviewProps()}>{api.dragValues.length} items</div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
