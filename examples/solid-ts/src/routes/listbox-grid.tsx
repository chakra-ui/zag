import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { listboxControls, selectData } from "@zag-js/shared"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

interface Item {
  label: string
  value: string
}

export default function Page() {
  const controls = useControls(listboxControls)

  const collection = listbox.gridCollection({
    items: selectData,
    columnCount: 3,
  })

  const service = useMachine(
    listbox.machine as listbox.Machine<Item>,
    controls.mergeProps({
      collection,
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <ul {...api().getContentProps()}>
            <For each={collection.items}>
              {(item) => (
                <li {...api().getItemProps({ item })}>
                  {item.label}
                  <span {...api().getItemIndicatorProps({ item })}>✓</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["highlightedValue"]} />
      </Toolbar>
    </>
  )
}
