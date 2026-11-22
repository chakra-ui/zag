"use client"

import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [query, setQuery] = useState("")

  const collection = combobox.collection({
    items: comboboxData.filter((item) => contains(item.label, query)),
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    multiple: true,
    defaultValue: ["US", "CA"],
    onInputValueChange({ inputValue }) {
      setQuery(inputValue)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Countries</label>
          <div {...api.getControlProps()}>
            <div {...api.getChipGroupProps()}>
              {api.selectedItems.map((item) => (
                <span key={item.code} {...api.getChipProps({ item })}>
                  {item.label}
                  <button {...api.getChipDeleteTriggerProps({ item })}>
                    <XIcon />
                  </button>
                </span>
              ))}
              <input {...api.getInputProps()} placeholder={api.value.length ? "" : "Add countries"} />
            </div>
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getListProps()}>
              {collection.items.map((item) => (
                <div key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["value", "inputValue", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
