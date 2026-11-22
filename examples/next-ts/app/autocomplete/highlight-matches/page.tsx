"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Highlight } from "@/components/highlight"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")
  const items = fruits.filter((fruit) => contains(fruit, value))

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items }),
    placeholder: "e.g. berry",
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Favorite fruit</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>No fruits found</div>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>
                    <Highlight text={item} query={value} />
                  </span>
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
