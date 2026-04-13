import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
]

export default function Page() {
  const [items, setItems] = createSignal(initialItems)

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    onDrop(details) {
      const { source, target, placement } = details
      if (placement === "on") return
      setItems((prev) => {
        const fromIndex = prev.findIndex((item) => item.id === source)
        const toIndex = prev.findIndex((item) => item.id === target)
        if (fromIndex === -1 || toIndex === -1) return prev
        return dnd.move(prev, fromIndex, dnd.getDestinationIndex(prev.length, fromIndex, toIndex, placement))
      })
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  return (
    <>
      <main class="dnd">
        <div {...api().getRootProps()}>
          <h3>Sortable List</h3>
          <ul style={{ "list-style": "none", padding: "0" }}>
            <For each={items()}>
              {(item) => (
                <li style={{ position: "relative" }}>
                  <div {...api().getDropIndicatorProps({ value: item.id, placement: "before" })} />
                  <div
                    {...mergeProps(
                      api().getDraggableProps({ value: item.id }),
                      api().getDropTargetProps({ value: item.id }),
                    )}
                  >
                    <span {...api().getDragHandleProps({ value: item.id })}>
                      <GripVertical size={14} />
                    </span>
                    {item.label}
                  </div>
                  <div {...api().getDropIndicatorProps({ value: item.id, placement: "after" })} />
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
