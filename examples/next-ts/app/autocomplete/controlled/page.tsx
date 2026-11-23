"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/utils/search"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

const fruits = ["Apple", "Apricot", "Banana", "Blackberry", "Blueberry", "Cherry", "Grape", "Mango", "Pineapple"]

const MAX_LENGTH = 12

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const record = (entry: string) => setLog((prev) => [entry, ...prev].slice(0, 8))
  const items = fruits.filter((fruit) => contains(fruit, value))

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items }),
    value,
    onValueChange(details) {
      // Ignoring a change keeps the previous text in the input
      if (details.value.length > MAX_LENGTH) return
      setValue(details.value)
      record(`value: ${details.reason}`)
    },
    open,
    onOpenChange(details) {
      setOpen(details.open)
      record(`${details.open ? "opened" : "closed"}: ${details.reason}`)
    },
    onHighlightChange(details) {
      if (details.highlightedValue) record(`highlighted ${details.highlightedValue}`)
    },
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Fruit ({MAX_LENGTH} characters at most)</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
          </div>
        </div>

        <div className="autocomplete-form">
          <button onClick={() => setValue("Mango")}>Set to Mango</button>
          <button onClick={() => setOpen((prev) => !prev)}>Toggle open</button>
        </div>

        <pre data-testid="log">{log.join("\n") || "—"}</pre>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>No fruits found</div>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
