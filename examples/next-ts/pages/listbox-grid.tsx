import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { listboxControls, selectData } from "@zag-js/shared"
import { useId } from "react"
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

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id: useId(),
    ...controls.context,
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <ul {...api.getContentProps()}>
            {collection.items.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })}>
                {item.label}
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} omit={["collection"]} context={["highlightedValue"]} />
      </Toolbar>
    </>
  )
}
