"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { ChevronsUpDownIcon, XIcon } from "lucide-react"
import { useId } from "react"
import "@styles/select.css"

interface Item {
  label: string
  value: string
  disabled?: boolean
}

export default function Page() {
  const service = useMachine(select.machine as select.Machine<Item>, {
    id: useId(),
    collection: select.collection({
      items: [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Cherry", value: "cherry" },
        { label: "Coconut", value: "coconut" },
        { label: "Date", value: "date" },
        { label: "Duck", value: "duck", disabled: true },
        { label: "Elephant", value: "elephant" },
        { label: "Fish", value: "fish" },
        { label: "Giraffe", value: "giraffe" },
        { label: "Hippo", value: "hippo" },
        { label: "Igloo", value: "igloo" },
      ],
    }),
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Label</label>
        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <span>{api.valueAsString || "Select option"}</span>
          </button>
          <div className="select-indicator-group">
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
            <span {...api.getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </div>
        </div>
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getListProps()}>
                {api.collection.items.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
