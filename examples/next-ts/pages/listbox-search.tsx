import { createFilter } from "@zag-js/i18n-utils"
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { listboxControls, selectData } from "@zag-js/shared"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

interface Item {
  label: string
  value: string
}

const filter = createFilter({ sensitivity: "base" })

export default function Page() {
  const [search, setSearch] = useState("")

  const collection = useMemo(() => {
    const items = selectData.filter((item) => filter.startsWith(item.label, search))
    return listbox.collection({ items })
  }, [search])

  const controls = useControls(listboxControls)

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
          <input
            {...api.getInputProps({ autoHighlight: true })}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <ul {...api.getContentProps()}>
            {collection.items.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
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
