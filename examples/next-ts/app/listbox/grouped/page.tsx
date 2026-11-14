"use client"

import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { groupedData, listboxControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/listbox.css"

type Item = (typeof groupedData)[number]

export default function Page() {
  const controls = useControls(listboxControls)

  const collection = listbox.collection({ items: groupedData, groupBy: (item) => item.type })

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
          <div {...api.getContentProps()}>
            <div {...api.getListProps()}>
              {collection.group().map(([type, items]) => (
                <div key={type} {...api.getItemGroupProps({ id: type })}>
                  <div {...api.getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                  {items.map((item) => (
                    <div key={item.value} {...api.getItemProps({ item })}>
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} context={["highlightedValue"]} />
      </Toolbar>
    </>
  )
}
