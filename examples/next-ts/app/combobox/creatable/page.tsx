"use client"

import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const toItem = (label: string): Item => ({ label, value: label.toLowerCase() })

const initialItems = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const [query, setQuery] = useState("")

  const search = query.trim()
  const filtered = items.filter((item) => contains(item.label, search))
  // The "Create" option is the new item itself, so selecting it needs no extra mapping
  const exists = items.some((item) => item.label.toLowerCase() === search.toLowerCase())
  const newItem = search && !exists ? toItem(search) : null
  const options = newItem ? [...filtered, newItem] : filtered

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    allowCustomValue: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") setQuery("")
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") setQuery(inputValue)
    },
    onValueChange({ items: selected }) {
      const [item] = selected as Item[]
      if (item && !items.some((existing) => existing.value === item.value)) {
        setItems((prev) => [...prev, item])
      }
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} placeholder="Search or create" />
            <button {...api.getTriggerProps()}>▼</button>
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getListProps()}>
              {options.map((item) => (
                <div key={item.value} {...api.getItemProps({ item })}>
                  <span {...api.getItemIndicatorProps({ item })}>✅</span>
                  <span>{item === newItem ? `Create "${item.label}"` : item.label}</span>
                </div>
              ))}
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
