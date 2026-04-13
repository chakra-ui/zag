import { useVirtualizer } from "@tanstack/react-virtual"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useRef, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const initialItems = Array.from({ length: 500 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const scrollRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 40,
    overscan: 10,
  })

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
          <div ref={scrollRef} style={{ maxHeight: 400, overflow: "auto" }}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = items[virtualItem.index]
                return (
                  <div
                    key={item.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${virtualItem.start}px)`,
                      height: virtualItem.size,
                    }}
                  >
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
