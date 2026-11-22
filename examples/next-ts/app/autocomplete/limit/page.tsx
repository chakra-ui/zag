"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

const LIMIT = 8

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")

  const matches = comboboxData.filter((item) => contains(item.label, value))
  const items = matches.slice(0, LIMIT)
  const hidden = matches.length - items.length

  const service = useMachine(autocomplete.machine as autocomplete.Machine<Item>, {
    id: useId(),
    collection: autocomplete.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
    placeholder: "Search countries",
    openOnClick: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Country (first {LIMIT} matches)</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>No results for "{value}"</div>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                </li>
              ))}
            </ul>
            {hidden > 0 && (
              <div className="autocomplete-status" role="status">
                Hiding {hidden} results. Type more to narrow them.
              </div>
            )}
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
