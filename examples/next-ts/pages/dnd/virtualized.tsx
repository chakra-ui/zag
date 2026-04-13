import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useState } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const initialItems = Array.from({ length: 500 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [items, setItems] = useState(initialItems)

  const { virtualizer, ref } = useListVirtualizer({
    count: initialItems.length,
    estimatedSize: () => 40,
    overscan: 10,
  })

  // Sync count before render
  virtualizer.updateOptions({ count: items.length })

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
          <h3>Virtualized (500 items)</h3>
          <div ref={ref} onScroll={virtualizer.handleScroll} style={{ maxHeight: 400, overflow: "auto" }}>
            <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const item = items[vi.index]
                return (
                  <div key={item.id} style={virtualizer.getItemStyle(vi)}>
                    <div style={{ position: "relative", height: "100%" }}>
                      <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
                      <div
                        {...mergeProps(
                          api.getDraggableProps({ value: item.id }),
                          api.getDropTargetProps({ value: item.id }),
                        )}
                      >
                        <span {...api.getDragHandleProps({ value: item.id })}>
                          <GripVerticalIcon size={14} />
                        </span>
                        {item.label}
                      </div>
                      <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
                    </div>
                  </div>
                )
              })}
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
